'use client'

import { useState, useCallback, useEffect } from 'react'

interface Block {
  id: string
  function: string
  label: string
  description: string
  variables: Variable[]
}

interface Variable {
  name: string
  label: string
  _type: 'input' | 'textArea' | 'list' | 'select' | 'radio' | 'checkbox'
  description?: string
  defaultValue?: any
  selectList?: Array<{ label: string; value: string }>
  radioList?: Array<{ label: string; value: string }>
}

interface SlidevEditorState {
  blocks: Block[]
  variables: Record<string, any>
  preview: string
  loading: boolean
  error: string | null
}

export function useSlidevEditor(templateId: string) {
  const [state, setState] = useState<SlidevEditorState>({
    blocks: [],
    variables: {},
    preview: '',
    loading: true,
    error: null
  })

  // Fetch template blocks
  const fetchBlocks = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/slidev/${templateId}/blocks`)
      if (!response.ok) {
        throw new Error(`Failed to fetch blocks: ${response.statusText}`)
      }
      
      const data = await response.json()
      const blocks = data.responseObject || []
      
      // Initialize variables with default values
      const initialVariables: Record<string, any> = {}
      blocks.forEach((block: Block) => {
        block.variables.forEach((variable: Variable) => {
          if (variable.defaultValue !== undefined) {
            initialVariables[variable.name] = variable.defaultValue
          } else {
            // Set sensible defaults based on type
            switch (variable._type) {
              case 'input':
                initialVariables[variable.name] = ''
                break
              case 'textArea':
                initialVariables[variable.name] = ''
                break
              case 'list':
                initialVariables[variable.name] = []
                break
              case 'checkbox':
                initialVariables[variable.name] = false
                break
              case 'select':
              case 'radio':
                initialVariables[variable.name] = variable.selectList?.[0]?.value || variable.radioList?.[0]?.value || ''
                break
              default:
                initialVariables[variable.name] = ''
            }
          }
        })
      })
      
      setState(prev => ({
        ...prev,
        blocks,
        variables: initialVariables,
        loading: false
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load template',
        loading: false
      }))
    }
  }, [templateId])

  // Update a variable value
  const updateVariable = useCallback((name: string, value: any) => {
    setState(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [name]: value
      }
    }))
  }, [])

  // Generate preview with current variables
  const generatePreview = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/slidev/${templateId}/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: state.variables
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate preview: ${response.statusText}`)
      }
      
      const data = await response.json()
      setState(prev => ({
        ...prev,
        preview: data.responseObject || '',
        loading: false
      }))
    } catch (err) {
      console.error('Preview generation failed:', err)
      setState(prev => ({
        ...prev,
        loading: false
      }))
    }
  }, [templateId, state.variables])

  // Export presentation
  const exportPresentation = useCallback(async (format: 'pdf' | 'html' | 'spa') => {
    try {
      // For now, just download the markdown
      const blob = new Blob([state.preview], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${templateId}-presentation.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      throw err
    }
  }, [state.preview, templateId])

  // Load blocks on mount
  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  return {
    blocks: state.blocks,
    variables: state.variables,
    preview: state.preview,
    loading: state.loading,
    error: state.error,
    updateVariable,
    generatePreview,
    exportPresentation,
    refetch: fetchBlocks
  }
}
