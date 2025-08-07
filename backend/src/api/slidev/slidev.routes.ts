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

    // Preview routes
    const PreviewRequestSchema = CompileSlidevRequestSchema.extend({
        config: z.object({
            port: z.number().optional(),
            host: z.string().optional(),
            theme: z.string().optional(),
            remote: z.boolean().optional()
        }).optional()
    })

    const PreviewInstanceSchema = z.object({
        id: z.string(),
        port: z.number(),
        status: z.enum(['starting', 'running', 'stopped', 'error']),
        url: z.string(),
        templateId: z.string()
    })

    slidevRegistry.register('PreviewRequest', PreviewRequestSchema)
    slidevRegistry.register('PreviewInstance', PreviewInstanceSchema)

    // Start Slidev preview
    slidevRegistry.registerPath({
        method: 'post',
        path: '/slidev/preview/start',
        tags: ['Slidev Preview'],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: PreviewRequestSchema,
                    },
                },
            },
        },
        responses: createApiResponse(PreviewInstanceSchema, 'Preview started successfully'),
    })

    router.post('/preview/start', async (req: Request, res: Response) => {
        try {
            const serviceResponse = await slidevController.startSlidevPreview(req.body)
            return handleServiceResponse(serviceResponse, res)
        } catch (error) {
            const errorResponse = new ServiceResponse(ResponseStatus.Failed, 'Failed to start preview', null, 500)
            return handleServiceResponse(errorResponse, res)
        }
    })

    // Update Slidev preview
    slidevRegistry.registerPath({
        method: 'put',
        path: '/slidev/preview/{instanceId}',
        tags: ['Slidev Preview'],
        request: {
            params: z.object({
                instanceId: z.string()
            }),
            body: {
                content: {
                    'application/json': {
                        schema: CompileSlidevRequestSchema,
                    },
                },
            },
        },
        responses: createApiResponse(z.boolean(), 'Preview updated successfully'),
    })

    router.put('/preview/:instanceId', async (req: Request, res: Response) => {
        try {
            const { instanceId } = req.params
            const serviceResponse = await slidevController.updateSlidevPreview(instanceId, req.body)
            return handleServiceResponse(serviceResponse, res)
        } catch (error) {
            const errorResponse = new ServiceResponse(ResponseStatus.Failed, 'Failed to update preview', null, 500)
            return handleServiceResponse(errorResponse, res)
        }
    })

    // Stop Slidev preview
    slidevRegistry.registerPath({
        method: 'delete',
        path: '/slidev/preview/{instanceId}',
        tags: ['Slidev Preview'],
        request: {
            params: z.object({
                instanceId: z.string()
            })
        },
        responses: createApiResponse(z.boolean(), 'Preview stopped successfully'),
    })

    router.delete('/preview/:instanceId', async (req: Request, res: Response) => {
        try {
            const { instanceId } = req.params
            const serviceResponse = await slidevController.stopSlidevPreview(instanceId)
            return handleServiceResponse(serviceResponse, res)
        } catch (error) {
            const errorResponse = new ServiceResponse(ResponseStatus.Failed, 'Failed to stop preview', null, 500)
            return handleServiceResponse(errorResponse, res)
        }
    })

    // Get all preview instances
    slidevRegistry.registerPath({
        method: 'get',
        path: '/slidev/preview/instances',
        tags: ['Slidev Preview'],
        responses: createApiResponse(z.array(PreviewInstanceSchema), 'Preview instances retrieved successfully'),
    })

    router.get('/preview/instances', async (req: Request, res: Response) => {
        const serviceResponse = slidevController.getSlidevPreviewInstances()
        return handleServiceResponse(serviceResponse, res)
    })

    // Get specific preview instance
    slidevRegistry.registerPath({
        method: 'get',
        path: '/slidev/preview/{instanceId}',
        tags: ['Slidev Preview'],
        request: {
            params: z.object({
                instanceId: z.string()
            })
        },
        responses: createApiResponse(PreviewInstanceSchema, 'Preview instance retrieved successfully'),
    })

    router.get('/preview/:instanceId', async (req: Request, res: Response) => {
        const { instanceId } = req.params
        const serviceResponse = slidevController.getSlidevPreviewInstance(instanceId)
        return handleServiceResponse(serviceResponse, res)
    })

    return router
})()
