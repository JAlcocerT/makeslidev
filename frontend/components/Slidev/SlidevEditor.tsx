'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Eye, Download, Share2 } from 'lucide-react'
import SlidevBlockEditor from './SlidevBlockEditor'
import SlidevPreview from './SlidevPreview'
import { useSlidevEditor } from '@/hooks/useSlidevEditor'

interface SlidevEditorProps {
  templateId: string
}

export default function SlidevEditor({ templateId }: SlidevEditorProps) {
  const router = useRouter()
  const {
    blocks,
    variables,
    preview,
    loading,
    error,
    updateVariable,
    generatePreview,
    exportPresentation
  } = useSlidevEditor(templateId)

  const [activeTab, setActiveTab] = useState('editor')

  useEffect(() => {
    // Generate initial preview when component mounts
    generatePreview()
  }, [generatePreview])

  const handleBack = () => {
    router.push('/slidev')
  }

  const handlePreview = () => {
    generatePreview()
    setActiveTab('preview')
  }

  const handleExport = async () => {
    try {
      await exportPresentation('pdf')
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBack} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {templateId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Editor
              </h1>
              <p className="text-sm text-gray-500">
                Edit your presentation with live preview
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={handlePreview} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Block Editor */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Slide Blocks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SlidevBlockEditor
                      blocks={blocks}
                      variables={variables}
                      onVariableChange={updateVariable}
                      onPreviewUpdate={generatePreview}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Live Preview */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SlidevPreview
                      preview={preview}
                      templateId={templateId}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <SlidevPreview
                  preview={preview}
                  templateId={templateId}
                  loading={loading}
                  fullscreen={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
