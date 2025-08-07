import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import express, { Request, Response, Router } from 'express'
import { z } from 'zod'

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders'
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse'
import { handleServiceResponse } from '@/common/utils/httpHandlers'
import SlidevController, { CompileSlidevRequest } from './slidev.controller'

export const slidevRegistry = new OpenAPIRegistry()
export const slidevRouter: Router = (() => {
    const router = express.Router()
    const slidevController = new SlidevController()

    // Schema definitions
    const SlidevTemplateSchema = z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
    })

    const CompileSlidevRequestSchema = z.object({
        templateId: z.string(),
        variables: z.record(z.any()),
        blocks: z.array(z.any()),
    })

    slidevRegistry.register('SlidevTemplate', SlidevTemplateSchema)
    slidevRegistry.register('CompileSlidevRequest', CompileSlidevRequestSchema)

    // Get all Slidev templates
    slidevRegistry.registerPath({
        method: 'get',
        path: '/slidev/templates',
        tags: ['Slidev'],
        responses: createApiResponse(z.array(z.string()), 'Success'),
    })

    router.get('/templates', async (req: Request, res: Response) => {
        const serviceResponse = await slidevController.getSlidevTemplates()
        return handleServiceResponse(serviceResponse, res)
    })

    // Get specific Slidev template preview
    slidevRegistry.registerPath({
        method: 'get',
        path: '/slidev/{id}/preview',
        tags: ['Slidev'],
        request: {
            params: z.object({
                id: z.string(),
            }),
        },
        responses: createApiResponse(z.string(), 'Success'),
    })

    router.get('/:id/preview', async (req: Request, res: Response) => {
        const id = req.params.id as string
        const serviceResponse = await slidevController.getSlidevPreview(id)
        return handleServiceResponse(serviceResponse, res)
    })

    // Get Slidev template blocks
    slidevRegistry.registerPath({
        method: 'get',
        path: '/slidev/{id}/blocks',
        tags: ['Slidev'],
        request: {
            params: z.object({
                id: z.string(),
            }),
        },
        responses: createApiResponse(z.array(z.any()), 'Success'),
    })

    router.get('/:id/blocks', async (req: Request, res: Response) => {
        const id = req.params.id as string
        const serviceResponse = await slidevController.getSlidevTemplateBlocks(id)
        return handleServiceResponse(serviceResponse, res)
    })

    // Compile Slidev template
    slidevRegistry.registerPath({
        method: 'post',
        path: '/slidev/compile',
        tags: ['Slidev'],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CompileSlidevRequestSchema,
                    },
                },
            },
        },
        responses: createApiResponse(z.string(), 'Success'),
    })

    router.post('/compile', async (req: Request, res: Response) => {
        try {
            const compilationRequest: CompileSlidevRequest = req.body
            const serviceResponse = await slidevController.compileSlidevTemplate(compilationRequest)
            return handleServiceResponse(serviceResponse, res)
        } catch (error) {
            const errorResponse = new ServiceResponse(ResponseStatus.Failed, 'Invalid request body', null, 400)
            return handleServiceResponse(errorResponse, res)
        }
    })

    return router
})()
