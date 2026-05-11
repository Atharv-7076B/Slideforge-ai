import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'

import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'

import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'

import { GenerationStatus } from '#/features/components/generation-status'

import { usePresentationDetail } from '#/features/presentation/hooks/usePresentation-detail'

import { presentationThumbnailUrl } from '#/features/utils'

import { getSession } from '#/lib/auth.functions'

import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Play,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'

import { useState } from 'react'

export const Route = createFileRoute('/presentations/$presentationId')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },

  component: PresentationPage,
})

function PresentationPage() {
  const { presentationId } = Route.useParams()

  const navigate = useNavigate()

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const [showSettings, setShowSettings] = useState(false)

  const [isExporting] = useState(false)

  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  const {
    query,
    slides,
    isGenerating,
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
      <main className="min-h-screen px-4 pt-24 pb-12">
        <div className="mx-auto max-w-6xl text-muted-foreground">
          Loading presentation…
        </div>
      </main>
    )
  }

  if (query.isError) {
    const error = query.error

    return (
      <main className="min-h-screen px-4 pt-24 pb-12">
        <div className="mx-auto max-w-6xl space-y-4">
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

  const data = query.data

  if (!data) {
    return null
  }

  const thumb = presentationThumbnailUrl(data.id)

  const activeSlide = slides.at(activeSlideIndex)

  return (
    <main className="min-h-screen px-4 pt-24 pb-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 rounded-xl"
            >
              <Link to="/">
                <ArrowLeft className="size-4" />
                Home
              </Link>
            </Button>

            <GenerationStatus status={data.status} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="glass flex items-center gap-4 rounded-2xl p-4">
              <img
                src={thumb}
                alt=""
                width={56}
                height={56}
                className="rounded-xl border border-border/50 bg-background/30"
              />

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-semibold">{data.title}</h1>

                <p className="text-sm text-muted-foreground">
                  {slides.length} slides
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {slides.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 rounded-xl"
                      onClick={() => {}}
                    >
                      <Play className="size-4" />

                      <span className="hidden sm:inline">Slideshow</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 rounded-xl"
                      onClick={() => {}}
                      disabled={isExporting}
                    >
                      <Download className="size-4" />

                      <span className="hidden sm:inline">
                        {isExporting ? 'Exporting…' : 'Export'}
                      </span>
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 rounded-xl"
                  disabled={regenerateMut.isPending || isGenerating}
                  onClick={() => regenerateMut.mutate()}
                >
                  <RefreshCw
                    className={`size-4 ${isGenerating ? 'animate-spin' : ''}`}
                  />

                  <span className="hidden sm:inline">
                    {isGenerating ? 'Generating…' : 'Regenerate'}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? 'Hide settings' : 'Edit settings'}
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="glass space-y-4 rounded-2xl p-6">
                <div className="space-y-2">
                  <Label htmlFor="pres-title" className="text-sm font-medium">
                    Title
                  </Label>

                  <input
                    id="pres-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        title: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prompt</Label>

                  <Textarea
                    value={form.prompt}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        prompt: e.target.value,
                      }))
                    }
                    className="min-h-[120px] resize-y rounded-xl border-border/50 bg-background/50 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Slides: {form.slideCount}
                    </Label>

                    <Slider
                      value={[form.slideCount]}
                      onValueChange={([v]) =>
                        setForm((s) => ({
                          ...s,
                          slideCount: v,
                        }))
                      }
                      min={3}
                      max={20}
                      step={1}
                      className="py-2"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-between gap-3 pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="gap-2 rounded-xl"
                        disabled={deleteMut.isPending}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="glass">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete presentation?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMut.mutate()}
                        >
                          {deleteMut.isPending ? 'Deleting…' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    type="button"
                    size="sm"
                    className="gap-2 rounded-xl"
                    disabled={updateMut.isPending}
                    onClick={() => updateMut.mutate()}
                  >
                    <Save className="size-4" />

                    {updateMut.isPending ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            )}

            {activeSlide && (
              <div className="space-y-3">
                <div id="slide-preview-container" className="group relative">
                  <SlidePreview
                    slide={activeSlide}
                    isFullscreen={isFullscreen}
                  />

                  <Button
                    variant="secondary"
                    size="icon"
                    className={`absolute top-3 right-3 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 ${
                      isFullscreen ? 'opacity-100' : ''
                    }`}
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 rounded-xl"
                    disabled={activeSlideIndex === 0}
                    onClick={() =>
                      setActiveSlideIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    {activeSlideIndex + 1} / {slides.length}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 rounded-xl"
                    disabled={activeSlideIndex >= slides.length - 1}
                    onClick={() =>
                      setActiveSlideIndex((i) =>
                        Math.min(slides.length - 1, i + 1),
                      )
                    }
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function SlidePreview({
  slide,
  isFullscreen,
}: {
  slide: any
  isFullscreen: boolean
}) {
  return (
    <div
      className={`glass rounded-2xl border border-border/50 bg-background/30 p-10 ${
        isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'min-h-[500px]'
      }`}
    >
      <h2 className="text-3xl font-bold">{slide?.title || 'Untitled Slide'}</h2>

      <p className="mt-6 text-muted-foreground">
        {slide?.content || 'No slide content available'}
      </p>
    </div>
  )
}
