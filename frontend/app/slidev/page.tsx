import { Metadata } from 'next'
import SlidevTemplateSelector from '@/components/Slidev/SlidevTemplateSelector'

export const metadata: Metadata = {
  title: 'Slidev Template Generator | MakeSlidev',
  description: 'Create beautiful presentations with live editing and real-time preview using Slidev templates.',
}

export default function SlidevPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MakeSlidev
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create stunning presentations with live editing and real-time preview. 
            Choose a template and start building your story.
          </p>
        </div>
        
        <SlidevTemplateSelector />
      </div>
    </div>
  )
}
