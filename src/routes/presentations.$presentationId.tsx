import { Button } from '#/components/ui/button'
import { GenerationStatus } from '#/features/components/generation-status'
import { usePresentationDetail } from '#/features/presentation/hooks/usePresentation-detail'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/presentations/$presentationId')({
  component: PresentationPage,
})

function PresentationPage() {
  const { presentationId } = Route.useParams()
  const navigate = useNavigate()
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const {
    query,
    slides,
    isGenerating,
    updatedLabel,
    form,
    setForm,
    updateMut,
    regenerateMut,
    deleteMut,
  } = usePresentationDetail(presentationId, {
    onDeleted: () => navigate({ to: '/' }),
  })

  if (query.isPending) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-muted-foreground">
          Loading presentation…
        </div>
      </main>
    )
  }

  if (query.isError) {
    const error = query.error
    return (
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <p className="text-destructive">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </main>
    )
  }
const data = query.data;
  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1"
            >
              <Link to="/">
                <ArrowLeft className="size-4" />
                Home
              </Link>
            </Button>
            <GenerationStatus status={data.status} />
          </div>
        </div>
      </div>
    </main>
  )
}
