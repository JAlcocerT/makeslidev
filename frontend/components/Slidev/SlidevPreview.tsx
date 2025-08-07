'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Eye, FileText, Download } from 'lucide-react'

interface SlidevPreviewProps {
  preview: string
  templateId: string
  loading?: boolean
  fullscreen?: boolean
}

export default function SlidevPreview({
  preview,
  templateId,
  loading = false,
  fullscreen = false
}: SlidevPreviewProps) {
  const [activeTab, setActiveTab] = useState('rendered')
  const [slideCount, setSlideCount] = useState(0)

  useEffect(() => {
    // Count slides by counting slide separators
    if (preview) {
      const slides = preview.split('---').filter(slide => slide.trim().length > 0)
      setSlideCount(Math.max(1, slides.length - 1)) // Subtract 1 for frontmatter
    }
  }, [preview])

  const downloadMarkdown = () => {
    const blob = new Blob([preview], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateId}-presentation.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openInSlidev = () => {
    // For demo purposes, we'll show how this would work
    // In a real implementation, this would start a Slidev dev server
    alert('In a full implementation, this would open your presentation in Slidev!\n\nFor now, you can copy the markdown and run:\nslidev presentation.md')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating preview...</p>
        </div>
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No preview available</p>
          <p className="text-sm text-gray-500">Configure your slides to see the preview</p>
        </div>
      </div>
    )
  }

  const containerClass = fullscreen 
    ? "h-screen" 
    : "h-96 border border-gray-200 rounded-lg"

  return (
    <div className="space-y-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {slideCount} slide{slideCount !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary">Slidev</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={downloadMarkdown} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={openInSlidev} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Open in Slidev
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className={containerClass}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rendered">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="markdown">
              <Code className="h-4 w-4 mr-2" />
              Markdown
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rendered" className="h-full mt-4">
            <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Slidev Preview Placeholder */}
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center p-8">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Slidev Preview
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your presentation is ready! In a full implementation, this would show a live Slidev preview.
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>✅ {slideCount} slides generated</p>
                      <p>✅ Markdown compiled</p>
                      <p>✅ Ready for Slidev</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="markdown" className="h-full mt-4">
            <div className="h-full bg-gray-900 rounded-lg overflow-hidden">
              <pre className="h-full overflow-auto p-4 text-sm text-gray-100">
                <code>{preview}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Info */}
      {!fullscreen && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 This preview shows your generated Slidev markdown</p>
          <p>🚀 Click "Open in Slidev" to see the full presentation</p>
          <p>📄 Use "Download" to save the markdown file</p>
        </div>
      )}
    </div>
  )
}
