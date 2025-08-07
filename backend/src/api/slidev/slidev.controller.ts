import fs from 'fs'
import path from 'path'
import { StatusCodes } from 'http-status-codes'
import nunjucks from 'nunjucks'

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse'
import { IFunction, FullTemplateModel } from '../templates/template.model'

// Configure Nunjucks for Slidev template rendering
nunjucks.configure({ autoescape: false, lstripBlocks: true })

export interface CompileSlidevRequest {
    templateId: string
    variables: Record<string, any>
    blocks: IFunction[]
}

export interface SlidevExportRequest {
    format: 'pdf' | 'html' | 'spa'
    content: string
    theme?: string
}

export default class SlidevController {
    /**
     * Get Slidev template preview
     */
    public async getSlidevPreview(id: string): Promise<ServiceResponse<string | null>> {
        try {
            if (!id || id === 'undefined') {
                return new ServiceResponse(ResponseStatus.Success, 'Success', '', StatusCodes.OK)
            }

            const filePath = path.join(process.cwd(), 'public', 'slidev-templates', id, 'preview.md')
            if (!fs.existsSync(filePath)) {
                return new ServiceResponse(ResponseStatus.Failed, 'Slidev template preview not found', null, StatusCodes.NOT_FOUND)
            }

            const previewData: string = fs.readFileSync(filePath, 'utf8')
            return new ServiceResponse<string>(ResponseStatus.Success, 'Success', previewData, StatusCodes.OK)
        } catch (ex) {
            console.error('Error getting Slidev preview:', ex)
            return new ServiceResponse(ResponseStatus.Failed, 'Failed to get Slidev preview', null, StatusCodes.INTERNAL_SERVER_ERROR)
        }
    }

    /**
     * Get Slidev template blocks configuration
     */
    public async getSlidevTemplateBlocks(id: string): Promise<ServiceResponse<IFunction[] | null>> {
        try {
            if (!id || id === 'undefined') {
                return new ServiceResponse(ResponseStatus.Failed, 'Template ID was not provided', null, StatusCodes.BAD_REQUEST)
            }

            // Try to load from TypeScript file first
            const tsFilePath = path.join(process.cwd(), 'public', 'slidev-templates', id, 'blocks.ts')
            if (fs.existsSync(tsFilePath)) {
                try {
                    // For now, we'll read the JSON file as it's more straightforward
                    const jsonFilePath = path.join(process.cwd(), 'public', 'slidev-templates', id, 'blocks.json')
                    if (fs.existsSync(jsonFilePath)) {
                        const blocksData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))
                        const blocks: IFunction[] = Object.values(blocksData)
                        return new ServiceResponse<IFunction[]>(ResponseStatus.Success, 'Success', blocks, StatusCodes.OK)
                    }
                } catch (parseError) {
                    console.error('Error parsing blocks file:', parseError)
                }
            }

            return new ServiceResponse(ResponseStatus.Failed, 'Slidev template blocks not found', null, StatusCodes.NOT_FOUND)
        } catch (ex) {
            console.error('Error getting Slidev template blocks:', ex)
            return new ServiceResponse(ResponseStatus.Failed, 'Failed to get Slidev template blocks', null, StatusCodes.INTERNAL_SERVER_ERROR)
        }
    }

    /**
     * Get all available Slidev templates
     */
    public async getSlidevTemplates(): Promise<ServiceResponse<string[] | null>> {
        try {
            const templatesDir = path.join(process.cwd(), 'public', 'slidev-templates')
            if (!fs.existsSync(templatesDir)) {
                return new ServiceResponse<string[]>(ResponseStatus.Success, 'No templates found', [], StatusCodes.OK)
            }

            const templates = fs.readdirSync(templatesDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)

            return new ServiceResponse<string[]>(ResponseStatus.Success, 'Success', templates, StatusCodes.OK)
        } catch (ex) {
            console.error('Error getting Slidev templates:', ex)
            return new ServiceResponse(ResponseStatus.Failed, 'Failed to get Slidev templates', null, StatusCodes.INTERNAL_SERVER_ERROR)
        }
    }

    /**
     * Compile Slidev template with variables
     */
    public async compileSlidevTemplate(request: CompileSlidevRequest): Promise<ServiceResponse<string | null>> {
        try {
            const { templateId, variables, blocks } = request

            if (!templateId || !blocks) {
                return new ServiceResponse(ResponseStatus.Failed, 'Missing required parameters', null, StatusCodes.BAD_REQUEST)
            }

            // Load macro files
            const macrosDir = path.join(process.cwd(), 'public', 'slidev-templates', templateId, 'slides')
            if (!fs.existsSync(macrosDir)) {
                return new ServiceResponse(ResponseStatus.Failed, 'Template macros not found', null, StatusCodes.NOT_FOUND)
            }

            // Read all macro files
            let macroDefinitions = ''
            const macroFiles = fs.readdirSync(macrosDir).filter(file => file.endsWith('.njk'))
            
            for (const macroFile of macroFiles) {
                const macroPath = path.join(macrosDir, macroFile)
                const macroContent = fs.readFileSync(macroPath, 'utf8')
                macroDefinitions += macroContent + '\n'
            }

            // Generate Slidev frontmatter
            const frontmatter = this.generateSlidevFrontmatter(variables)

            // Generate variable assignments for Nunjucks
            const variableString = this.mapVariableObjectToString(variables)

            // Generate slide content
            const slidesContent = this.combineSlidesIntoOrderedString(blocks)

            // Combine everything
            const fullContent = `${frontmatter}\n\n${variableString}${macroDefinitions}\n${slidesContent}`

            // Render with Nunjucks
            const renderedContent = nunjucks.renderString(fullContent, variables)

            return new ServiceResponse<string>(ResponseStatus.Success, 'Compilation successful', renderedContent, StatusCodes.OK)
        } catch (ex) {
            console.error('Error compiling Slidev template:', ex)
            return new ServiceResponse(ResponseStatus.Failed, 'Template compilation failed', null, StatusCodes.INTERNAL_SERVER_ERROR)
        }
    }

    /**
     * Generate Slidev frontmatter
     */
    private generateSlidevFrontmatter(variables: Record<string, any>): string {
        const theme = variables.theme || 'apple-basic'
        const background = variables.backgroundImage || 'https://source.unsplash.com/1920x1080/gradient'
        const title = variables.companyName || variables.presentationTitle || 'Slidev Presentation'

        return `---
theme: ${theme}
background: ${background}
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${title}
  Generated with MakeSlidev
drawings:
  persist: false
transition: slide-left
title: ${title}
---`
    }

    /**
     * Convert variables object to Nunjucks variable assignments
     */
    private mapVariableObjectToString(variables: Record<string, any>): string {
        let variablesString = ''

        Object.keys(variables).forEach((key: string) => {
            let value = variables[key]
            
            // Handle arrays (lists)
            if (Array.isArray(value)) {
                // Convert array to proper format for Nunjucks
                const arrayItems = value.map(item => `"${item}"`).join(', ')
                variablesString += `{%- set ${key} = [${arrayItems}] -%}\n`
            } else {
                // Handle strings and other types
                variablesString += `{%- set ${key} = ${JSON.stringify(value)} -%}\n`
            }
        })

        return variablesString
    }

    /**
     * Combine slide blocks into ordered Slidev format
     */
    private combineSlidesIntoOrderedString(blocks: IFunction[]): string {
        return blocks
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((block, index) => {
                const slideBreak = index > 0 ? '\n---\n' : ''
                
                let variableArray: string[] = []
                if (block.variables) {
                    block.variables.forEach((variable: any) => {
                        variableArray.push(variable.name)
                    })
                }

                return `${slideBreak}{{- ${block.function}(${variableArray.join(", ")}) -}}`
            })
            .join('\n')
    }
}
