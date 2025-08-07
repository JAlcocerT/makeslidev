'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Presentation, Play, Eye, FileText } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  category: string
  slideCount: number
  preview?: string
}

const TEMPLATE_DATA: Record<string, Template> = {
  'business-pitch': {
    id: 'business-pitch',
    title: 'Business Pitch',
    description: 'Professional business pitch template with problem-solution structure, market analysis, and team introduction.',
    category: 'Business',
    slideCount: 7,
  },
  'tech-presentation': {
    id: 'tech-presentation',
    title: 'Tech Presentation',
    description: 'Technical presentation template for showcasing technology solutions, architecture, and development roadmaps.',
    category: 'Technology',
    slideCount: 8,
  }
}

export default function SlidevTemplateSelector() {
  const [templates, setTemplates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/slidev/templates`)
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      setTemplates(data.responseObject || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/slidev/editor/${templateId}`)
  }

  const handlePreviewTemplate = (templateId: string) => {
    router.push(`/slidev/preview/${templateId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Failed to load templates</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchTemplates} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((templateId) => {
          const template = TEMPLATE_DATA[templateId] || {
            id: templateId,
            title: templateId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Template for ${templateId.replace('-', ' ')} presentations`,
            category: 'General',
            slideCount: 5,
          }

          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Presentation className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {template.slideCount} slides
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Slidev
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleSelectTemplate(template.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handlePreviewTemplate(template.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Presentation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No templates found</h3>
          <p className="text-gray-500">Check your backend connection and try again.</p>
        </div>
      )}
    </div>
  )
}
