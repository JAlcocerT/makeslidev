import fs from 'fs'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'
import { StatusCodes } from 'http-status-codes'
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse'

export interface SlidevPreviewConfig {
    port: number
    host: string
    theme?: string
    remote?: boolean
}

export interface SlidevPreviewInstance {
    id: string
    port: number
    process: ChildProcess
    status: 'starting' | 'running' | 'stopped' | 'error'
    url: string
    templateId: string
}

class SlidevPreviewService {
    private instances: Map<string, SlidevPreviewInstance> = new Map()
    private basePort = 3030
    private tempDir = path.join(process.cwd(), 'temp', 'slidev-previews')

    constructor() {
        // Ensure temp directory exists
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true })
        }
    }

    /**
     * Start a new Slidev preview instance
     */
    public async startPreview(
        templateId: string, 
        content: string, 
        config: Partial<SlidevPreviewConfig> = {}
    ): Promise<ServiceResponse<SlidevPreviewInstance | null>> {
        try {
            const instanceId = `${templateId}-${Date.now()}`
            const port = config.port || this.getNextAvailablePort()
            const host = config.host || 'localhost'

            // Create temporary markdown file
            const tempFilePath = path.join(this.tempDir, `${instanceId}.md`)
            fs.writeFileSync(tempFilePath, content, 'utf8')

            // Start Slidev process
            const slidevProcess = spawn('npx', [
                '@slidev/cli',
                tempFilePath,
                '--port', port.toString(),
                '--host', host,
                '--open', 'false',
                ...(config.theme ? ['--theme', config.theme] : []),
                ...(config.remote ? ['--remote'] : [])
            ], {
                cwd: this.tempDir,
                stdio: ['pipe', 'pipe', 'pipe']
            })

            const instance: SlidevPreviewInstance = {
                id: instanceId,
                port,
                process: slidevProcess,
                status: 'starting',
                url: `http://${host}:${port}`,
                templateId
            }

            this.instances.set(instanceId, instance)

            // Handle process events
            slidevProcess.stdout?.on('data', (data) => {
                const output = data.toString()
                console.log(`[Slidev ${instanceId}] ${output}`)
                
                // Check if server is ready
                if (output.includes('Local:') || output.includes('ready')) {
                    instance.status = 'running'
                }
            })

            slidevProcess.stderr?.on('data', (data) => {
                console.error(`[Slidev ${instanceId} Error] ${data.toString()}`)
            })

            slidevProcess.on('close', (code) => {
                console.log(`[Slidev ${instanceId}] Process exited with code ${code}`)
                instance.status = code === 0 ? 'stopped' : 'error'
                
                // Cleanup temp file
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath)
                }
            })

            slidevProcess.on('error', (error) => {
                console.error(`[Slidev ${instanceId}] Process error:`, error)
                instance.status = 'error'
            })

            // Wait a bit for the process to start
            await new Promise(resolve => setTimeout(resolve, 2000))

            return new ServiceResponse<SlidevPreviewInstance>(
                ResponseStatus.Success, 
                'Slidev preview started successfully', 
                instance, 
                StatusCodes.OK
            )

        } catch (error) {
            console.error('Error starting Slidev preview:', error)
            return new ServiceResponse(
                ResponseStatus.Failed, 
                'Failed to start Slidev preview', 
                null, 
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    /**
     * Stop a Slidev preview instance
     */
    public async stopPreview(instanceId: string): Promise<ServiceResponse<boolean>> {
        try {
            const instance = this.instances.get(instanceId)
            
            if (!instance) {
                return new ServiceResponse(
                    ResponseStatus.Failed, 
                    'Preview instance not found', 
                    false, 
                    StatusCodes.NOT_FOUND
                )
            }

            // Kill the process
            if (instance.process && !instance.process.killed) {
                instance.process.kill('SIGTERM')
                
                // Force kill after 5 seconds if still running
                setTimeout(() => {
                    if (!instance.process.killed) {
                        instance.process.kill('SIGKILL')
                    }
                }, 5000)
            }

            instance.status = 'stopped'
            this.instances.delete(instanceId)

            return new ServiceResponse<boolean>(
                ResponseStatus.Success, 
                'Preview stopped successfully', 
                true, 
                StatusCodes.OK
            )

        } catch (error) {
            console.error('Error stopping Slidev preview:', error)
            return new ServiceResponse(
                ResponseStatus.Failed, 
                'Failed to stop preview', 
                false, 
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    /**
     * Update preview content
     */
    public async updatePreview(instanceId: string, content: string): Promise<ServiceResponse<boolean>> {
        try {
            const instance = this.instances.get(instanceId)
            
            if (!instance) {
                return new ServiceResponse(
                    ResponseStatus.Failed, 
                    'Preview instance not found', 
                    false, 
                    StatusCodes.NOT_FOUND
                )
            }

            // Update the temporary markdown file
            const tempFilePath = path.join(this.tempDir, `${instanceId}.md`)
            fs.writeFileSync(tempFilePath, content, 'utf8')

            return new ServiceResponse<boolean>(
                ResponseStatus.Success, 
                'Preview updated successfully', 
                true, 
                StatusCodes.OK
            )

        } catch (error) {
            console.error('Error updating Slidev preview:', error)
            return new ServiceResponse(
                ResponseStatus.Failed, 
                'Failed to update preview', 
                false, 
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    /**
     * Get all running preview instances
     */
    public getInstances(): SlidevPreviewInstance[] {
        return Array.from(this.instances.values())
    }

    /**
     * Get a specific preview instance
     */
    public getInstance(instanceId: string): SlidevPreviewInstance | undefined {
        return this.instances.get(instanceId)
    }

    /**
     * Get next available port
     */
    private getNextAvailablePort(): number {
        const usedPorts = Array.from(this.instances.values()).map(i => i.port)
        let port = this.basePort
        
        while (usedPorts.includes(port)) {
            port++
        }
        
        return port
    }

    /**
     * Cleanup all instances on shutdown
     */
    public async cleanup(): Promise<void> {
        console.log('Cleaning up Slidev preview instances...')
        
        const stopPromises = Array.from(this.instances.keys()).map(id => 
            this.stopPreview(id)
        )
        
        await Promise.all(stopPromises)
        
        // Clean up temp directory
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true, force: true })
        }
    }
}

export default new SlidevPreviewService()
