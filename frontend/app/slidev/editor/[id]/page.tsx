import { Metadata } from 'next'
import SlidevEditor from '@/components/Slidev/SlidevEditor'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Edit ${params.id} | MakeSlidev`,
    description: `Edit your ${params.id} presentation with live preview and real-time updates.`,
  }
}

export default function SlidevEditorPage({ params }: PageProps) {
  return <SlidevEditor templateId={params.id} />
}
