import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { getPlaceholderImage } from '#/features/presentation/utils/placeholder-mapper'
import { parseSlideContent } from '#/features/presentation/utils/slide-content-parser'
import { getTheme } from '#/features/presentation/utils/theme-mapper'

type SlideCardProps = {
  slide: {
    id: string
    order: number
    title: string
    content: string
    notes?: string | null
    imageUrl?: string | null
  }
  isActive?: boolean
  onClick?: () => void
  style?: string | null
}

export function SlideCard({ slide, isActive, onClick, style }: SlideCardProps) {
  const contentData = parseSlideContent(slide.content)
  const theme = getTheme(style)
  
  const fallbackUrl = getPlaceholderImage(slide.title, slide.content || '')
  const [imageSrc, setImageSrc] = useState(slide.imageUrl || fallbackUrl)
  const [imageStatus, setImageStatus] = useState<
    'loading' | 'loaded' | 'error'
  >('loading')

  useEffect(() => {
    const nextSrc = slide.imageUrl || getPlaceholderImage(slide.title, slide.content || '')
    setImageSrc(nextSrc)
    setImageStatus('loading')
  }, [slide.imageUrl, slide.title, slide.content])

  const handleImageError = () => {
    const fallback = getPlaceholderImage(slide.title, slide.content || '')
    if (imageSrc !== fallback) {
      console.warn('[SlideCard] Failed to load image, falling back to placeholder:', fallback)
      setImageSrc(fallback)
    } else {
      setImageStatus('error')
    }
  }

  const renderMiniLayout = () => {
    const layoutType = contentData.layoutType || 'standard'
    
    switch (layoutType) {
      case 'hero':
        return (
          <div className="flex flex-col items-center justify-center h-full p-2 text-center scale-90">
            <div className="w-12 h-1 bg-current opacity-70 mb-1 rounded-xs" />
            <div className="w-16 h-0.5 bg-current opacity-40 rounded-xs" />
          </div>
        )
      case 'split-left':
        return (
          <div className="grid grid-cols-2 h-full w-full">
            <div className="relative w-full h-full bg-black/10">
              <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" onLoad={() => setImageStatus('loaded')} onError={handleImageError} />
            </div>
            <div className="flex flex-col justify-center p-2 space-y-1 scale-75 origin-left">
              <div className="w-10 h-1 bg-current opacity-80 rounded-xs" />
              <div className="w-8 h-0.5 bg-current opacity-40 rounded-xs" />
              <div className="w-6 h-0.5 bg-current opacity-40 rounded-xs" />
            </div>
          </div>
        )
      case 'split-right':
        return (
          <div className="grid grid-cols-2 h-full w-full">
            <div className="flex flex-col justify-center p-2 space-y-1 scale-75 origin-left">
              <div className="w-10 h-1 bg-current opacity-80 rounded-xs" />
              <div className="w-8 h-0.5 bg-current opacity-40 rounded-xs" />
              <div className="w-6 h-0.5 bg-current opacity-40 rounded-xs" />
            </div>
            <div className="relative w-full h-full bg-black/10">
              <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" onLoad={() => setImageStatus('loaded')} onError={handleImageError} />
            </div>
          </div>
        )
      case 'full-image':
        return (
          <div className="relative w-full h-full">
            <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-75" onLoad={() => setImageStatus('loaded')} onError={handleImageError} />
            <div className="absolute bottom-1 left-1 right-1 bg-black/40 backdrop-blur-xs p-1 rounded-xs scale-75 origin-bottom">
              <div className="w-8 h-0.5 bg-white opacity-90 rounded-xs" />
            </div>
          </div>
        )
      case 'quote':
        return (
          <div className="flex flex-col items-center justify-center h-full p-2 text-center italic scale-75">
            <span className="text-[10px] leading-none opacity-40">“</span>
            <div className="w-14 h-0.5 bg-current opacity-70 rounded-xs" />
            <div className="w-10 h-0.5 bg-current opacity-70 mt-0.5 rounded-xs" />
          </div>
        )
      case 'stats':
        return (
          <div className="grid grid-cols-2 h-full w-full">
            <div className="flex flex-col justify-center p-2 space-y-1 scale-75 origin-left">
              <div className="w-8 h-1 bg-current opacity-80 rounded-xs" />
              <div className="flex gap-1">
                <div className="w-4 h-2 bg-current opacity-30 rounded-xs" />
                <div className="w-4 h-2 bg-current opacity-30 rounded-xs" />
              </div>
            </div>
            <div className="relative w-full h-full bg-black/10">
              <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" onLoad={() => setImageStatus('loaded')} onError={handleImageError} />
            </div>
          </div>
        )
      case 'grid':
        return (
          <div className="flex flex-col justify-center h-full p-2 space-y-1">
            <div className="w-6 h-0.5 bg-current opacity-85 rounded-xs" />
            <div className="grid grid-cols-3 gap-1 w-full">
              <div className="h-3 bg-current opacity-10 rounded-xs border border-current/10" />
              <div className="h-3 bg-current opacity-10 rounded-xs border border-current/10" />
              <div className="h-3 bg-current opacity-10 rounded-xs border border-current/10" />
            </div>
          </div>
        )
      case 'standard':
      default:
        return (
          <div className="grid grid-cols-2 h-full w-full">
            <div className="flex flex-col justify-center p-2 space-y-1 scale-75 origin-left">
              <div className="w-10 h-1 bg-current opacity-80 rounded-xs" />
              <div className="w-8 h-0.5 bg-current opacity-40 rounded-xs" />
              <div className="w-6 h-0.5 bg-current opacity-40 rounded-xs" />
            </div>
            <div className="relative w-full h-full bg-black/10">
              <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" onLoad={() => setImageStatus('loaded')} onError={handleImageError} />
            </div>
          </div>
        )
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl p-3 transition-all ${
        isActive
          ? 'bg-primary/10 ring-2 ring-primary/50'
          : 'bg-card/50 hover:bg-card/80 border border-border/30 hover:border-border/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`shrink-0 flex items-center justify-center size-6 rounded-md text-xs font-semibold ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {slide.order + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium line-clamp-1 mb-2">
            {slide.title}
          </h3>
          <div className={`aspect-video rounded-lg overflow-hidden border border-border/10 relative ${theme.fontFamily} ${theme.gradientBg || theme.bg} ${theme.text}`}>
            {imageStatus === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-xs">
                <Loader2 className="size-4 text-muted-foreground animate-spin" />
              </div>
            )}
            {renderMiniLayout()}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
            {contentData.body || (contentData.bullets && contentData.bullets.join(', ')) || slide.title}
          </p>
        </div>
      </div>
    </button>
  )
}
