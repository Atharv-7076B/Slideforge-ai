import { getSession } from '#/lib/auth.functions'

import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
} from '#/features/constant/presentation-options'

import { presentationThumbnailUrl } from '#/features/utils'

import { usePresentationDetail } from '#/features/presentation/hooks/usePresentation-detail'

import { GenerationStatus } from '#/features/components/generation-status'
import { SlideCard } from '#/features/components/slide-card'
import { SlideshowModal } from '#/features/components/slideshow-model'
import { SlidePreview } from '#/features/components/slide-preview'
import { getPlaceholderImage } from '#/features/presentation/utils/placeholder-mapper'
import { exportPresentationToPPTX } from '#/features/presentation/utils/export-pptx'

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'

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

import { useCallback, useState } from 'react'

import { toast } from 'sonner'
import { useFullscreen } from '#/features/presentation/hooks/use-fullscreen'

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

    return {
      user: session.user,
    }
  },

  component: PresentationDetailPage,
})

function PresentationDetailPage() {
  const { presentationId } = Route.useParams()

  const navigate = useNavigate()

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const [showSettings, setShowSettings] = useState(false)

  const [showSlideshow, setShowSlideshow] = useState(false)

  const [isExporting, setIsExporting] = useState(false)
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, true>>(
    {},
  )

  const { isFullscreen, toggleFullscreen } = useFullscreen(
    'slide-preview-container',
  )

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

  const handleExport = useCallback(async () => {
    const presentationData = query.data
    if (!presentationData) {
      toast.error('Presentation data not loaded yet.')
      return
    }
    try {
      setIsExporting(true)
      toast.loading('Generating PowerPoint file...', { id: 'export-pptx' })

      console.log('[PPTX Export Button] Triggering PowerPoint generation...')
      await exportPresentationToPPTX(presentationData.title, presentationData.style, slides)
      
      toast.success('PowerPoint file downloaded successfully!', { id: 'export-pptx' })
    } catch (err) {
      console.error('[PPTX Export Button] Error during export:', err)
      toast.error(err instanceof Error ? err.message : 'PowerPoint export failed.', { id: 'export-pptx' })
    } finally {
      setIsExporting(false)
    }
  }, [query.data, slides])

  if (query.isPending) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-muted-foreground">
          Loading presentation...
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

  const data = query.data

  if (!data) {
    return null
  }

  const thumb = presentationThumbnailUrl(data.id)

  const activeSlide = slides.at(activeSlideIndex)
  const activeSlideImageUrl =
    activeSlide?.imageUrl && !failedImageUrls[activeSlide.imageUrl]
      ? activeSlide.imageUrl
      : activeSlide
        ? getPlaceholderImage(activeSlide.title, activeSlide.content)
        : null

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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="glass rounded-2xl p-4 flex items-center gap-4">
              <img
                src={thumb}
                alt=""
                width={56}
                height={56}
                className="rounded-xl border border-border/50 bg-background/30"
              />

              <div className="flex-1 min-w-0">
                <h1 className="font-semibold truncate">{data.title}</h1>

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
                      className="rounded-xl gap-1"
                      onClick={() => setShowSlideshow(true)}
                    >
                      <Play className="size-4" />

                      <span className="hidden sm:inline">Slideshow</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1"
                      onClick={handleExport}
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
                  className="rounded-xl gap-1"
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
              <div className="glass rounded-2xl p-6 space-y-4">
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
                    className="min-h-[120px] text-sm bg-background/50 border-border/50 rounded-xl resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Style</Label>

                    <Select
                      value={form.style}
                      onValueChange={(value) =>
                        setForm((s) => ({
                          ...s,
                          style:
                            value as (typeof SLIDE_STYLES)[number]['value'],
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className="glass">
                        {SLIDE_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tone</Label>

                    <Select
                      value={form.tone}
                      onValueChange={(value) =>
                        setForm((s) => ({
                          ...s,
                          tone: value as (typeof TONE_OPTIONS)[number]['value'],
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className="glass">
                        {TONE_OPTIONS.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Layout</Label>

                    <Select
                      value={form.layout}
                      onValueChange={(value) =>
                        setForm((s) => ({
                          ...s,
                          layout:
                            value as (typeof LAYOUT_OPTIONS)[number]['value'],
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className="glass">
                        {LAYOUT_OPTIONS.map((layout) => (
                          <SelectItem key={layout.value} value={layout.value}>
                            {layout.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between gap-3 pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="rounded-xl gap-2"
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
                    className="rounded-xl gap-2"
                    disabled={
                      updateMut.isPending ||
                      !form.title.trim() ||
                      !form.prompt.trim()
                    }
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
                <div id="slide-preview-container" className="relative group">
                  <SlidePreview
                    slide={activeSlide}
                    isFullscreen={isFullscreen}
                    style={data.style}
                  />

                  <Button
                    variant="secondary"
                    size="icon"
                    className={`absolute top-3 right-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                      isFullscreen ? 'opacity-100 z-[60]' : ''
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
                    className="rounded-xl gap-1"
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
                    className="rounded-xl gap-1"
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

            {slides.length === 0 && !isGenerating && (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No slides yet. Click regenerate to create slides.
                </p>

                <Button
                  className="rounded-xl gap-2"
                  onClick={() => regenerateMut.mutate()}
                  disabled={regenerateMut.isPending}
                >
                  <RefreshCw className="size-4" />
                  Generate slides
                </Button>
              </div>
            )}

            {slides.length === 0 && isGenerating && (
              <div className="glass rounded-2xl p-12 text-center">
                <RefreshCw className="size-8 animate-spin mx-auto mb-4 text-primary" />

                <p className="text-muted-foreground">
                  Generating your presentation...
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  This may take a minute
                </p>
              </div>
            )}
          </div>

          {slides.length > 0 && (
            <aside className="lg:w-80 xl:w-96 flex flex-col">
              <h2 className="font-medium text-sm px-2 pb-3 text-muted-foreground">
                Slides
              </h2>

              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2 -mr-2 space-y-4 max-h-[calc(100vh-14rem)]">
                {slides.map((slide, index) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    isActive={index === activeSlideIndex}
                    onClick={() => setActiveSlideIndex(index)}
                    style={data.style}
                  />
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      {showSlideshow && (
        <SlideshowModal
          slides={slides}
          initialIndex={activeSlideIndex}
          onClose={() => setShowSlideshow(false)}
          style={data.style}
        />
      )}
    </main>
  )
}
