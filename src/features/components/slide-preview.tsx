import { useState, useEffect } from 'react'
import { getPlaceholderImage } from '#/features/presentation/utils/placeholder-mapper'
import { parseSlideContent } from '#/features/presentation/utils/slide-content-parser'
import { getTheme } from '#/features/presentation/utils/theme-mapper'

type SlidePreviewProps = {
  slide: {
    id: string
    order: number
    title: string
    content: string
    notes?: string | null
    imageUrl?: string | null
  }
  isFullscreen?: boolean
  style?: string | null
}

export function SlidePreview({ slide, isFullscreen, style }: SlidePreviewProps) {
  const contentData = parseSlideContent(slide.content)
  const theme = getTheme(style)
  
  const fallbackUrl = getPlaceholderImage(slide.title, slide.content || '')
  const [imageSrc, setImageSrc] = useState(slide.imageUrl || fallbackUrl)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const nextSrc = slide.imageUrl || getPlaceholderImage(slide.title, slide.content || '')
    setImageSrc(nextSrc)
    setImageLoaded(false)
  }, [slide.imageUrl, slide.title, slide.content])

  const handleImageError = () => {
    const fallback = getPlaceholderImage(slide.title, slide.content || '')
    if (imageSrc !== fallback) {
      console.warn('[SlidePreview] Image failed to load, falling back to placeholder:', fallback)
      setImageSrc(fallback)
    }
  }

  // Helper to render the layout structure
  const renderLayout = () => {
    const layoutType = contentData.layoutType || 'standard'

    switch (layoutType) {
      case 'hero':
        return (
          <div className="flex flex-col justify-center items-center text-center h-full px-6 md:px-12 py-8 max-w-4xl mx-auto space-y-6 relative z-10">
            <h2 className={`font-black tracking-tight leading-tight ${isFullscreen ? 'text-4xl md:text-6xl lg:text-7xl' : 'text-2xl md:text-4xl'} ${theme.title}`}>
              {slide.title}
            </h2>
            {contentData.body && (
              <p className={`leading-relaxed max-w-2xl ${isFullscreen ? 'text-lg md:text-2xl text-white/90' : 'text-xs md:text-base opacity-90'} ${theme.body}`}>
                {contentData.body}
              </p>
            )}
          </div>
        )

      case 'split-left':
      case 'split-right':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
            {/* Text/Content Column */}
            <div className={`flex flex-col justify-center p-6 md:p-10 space-y-4 md:space-y-6 ${layoutType === 'split-right' ? 'order-1 md:order-1' : 'order-2 md:order-2'} relative z-10`}>
              <h2 className={`font-bold tracking-tight leading-tight ${isFullscreen ? 'text-3xl md:text-5xl' : 'text-xl md:text-3xl'} ${theme.title}`}>
                {slide.title}
              </h2>
              <div className="space-y-3 md:space-y-4">
                {contentData.body && (
                  <p className={`leading-relaxed ${isFullscreen ? 'text-base md:text-xl' : 'text-xs md:text-sm'} ${theme.body}`}>
                    {contentData.body}
                  </p>
                )}
                {contentData.bullets && contentData.bullets.length > 0 && (
                  <ul className="space-y-2 md:space-y-3">
                    {contentData.bullets.map((bullet, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isFullscreen ? 'text-base md:text-xl' : 'text-xs md:text-sm'} ${theme.body}`}>
                        <span className="mt-1.5 shrink-0 size-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Image Column */}
            <div className={`relative w-full h-full min-h-[150px] md:min-h-0 ${layoutType === 'split-right' ? 'order-2 md:order-2' : 'order-1 md:order-1'}`}>
              <img
                src={imageSrc}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
            </div>
          </div>
        )

      case 'full-image':
        return (
          <div className="relative w-full h-full">
            <img
              src={imageSrc}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
            
            {/* Overlay text card */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 max-w-2xl z-10">
              <div className={`p-4 md:p-6 rounded-xl border ${theme.card} shadow-xl space-y-3`}>
                <h2 className="font-bold tracking-tight text-lg md:text-3xl text-white">
                  {slide.title}
                </h2>
                {contentData.body && (
                  <p className="text-white/90 leading-relaxed text-xs md:text-sm">
                    {contentData.body}
                  </p>
                )}
                {contentData.bullets && contentData.bullets.length > 0 && (
                  <ul className="space-y-1">
                    {contentData.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white/85 text-xs md:text-sm">
                        <span className="mt-1.5 shrink-0 size-1.5 rounded-full bg-white" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )

      case 'quote':
        return (
          <div className="flex flex-col justify-center items-center text-center h-full px-6 md:px-12 py-8 max-w-4xl mx-auto space-y-4 md:space-y-6 relative z-10">
            <span className="text-5xl md:text-7xl opacity-20 font-serif leading-none" style={{ color: theme.accent }}>“</span>
            <h2 className={`font-medium italic leading-relaxed tracking-wide ${isFullscreen ? 'text-2xl md:text-4xl' : 'text-sm md:text-xl'} ${theme.text}`}>
              {contentData.quoteText || contentData.body || slide.title}
            </h2>
            {contentData.quoteAuthor && (
              <div className="flex items-center gap-2 pt-2 justify-center">
                <span className="w-6 h-px bg-current opacity-30" />
                <span className={`text-xs md:text-base font-bold ${theme.accentClass}`}>
                  {contentData.quoteAuthor}
                </span>
                <span className="w-6 h-px bg-current opacity-30" />
              </div>
            )}
          </div>
        )

      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
            {/* Metric Panel */}
            <div className="flex flex-col justify-center p-6 md:p-10 space-y-4 md:space-y-6 relative z-10">
              <h2 className={`font-bold tracking-tight leading-tight ${isFullscreen ? 'text-3xl md:text-5xl' : 'text-xl md:text-3xl'} ${theme.title}`}>
                {slide.title}
              </h2>
              {contentData.body && (
                <p className={`leading-relaxed ${isFullscreen ? 'text-base' : 'text-xs md:text-sm'} ${theme.body}`}>
                  {contentData.body}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                {contentData.stats?.map((stat, idx) => (
                  <div key={idx} className={`p-3 md:p-4 rounded-xl border ${theme.card} flex flex-col justify-center`}>
                    <span className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight" style={{ color: theme.accent }}>
                      {stat.value}
                    </span>
                    <span className={`text-[10px] md:text-xs font-semibold mt-1 uppercase tracking-wider ${theme.body} opacity-80`}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Image */}
            <div className="relative w-full h-full min-h-[150px] md:min-h-0">
              <img
                src={imageSrc}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className="flex flex-col justify-center h-full p-6 md:p-10 space-y-4 md:space-y-6 relative z-10">
            <div className="space-y-1">
              <h2 className={`font-bold tracking-tight leading-tight ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} ${theme.title}`}>
                {slide.title}
              </h2>
              {contentData.body && (
                <p className={`leading-relaxed ${isFullscreen ? 'text-base' : 'text-xs md:text-sm'} ${theme.body}`}>
                  {contentData.body}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {contentData.gridItems?.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${theme.card} hover:scale-[1.01] transition-all duration-200`}>
                  <div className="size-6 rounded-md flex items-center justify-center text-xs font-bold mb-2 md:mb-3" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
                    {idx + 1}
                  </div>
                  <h3 className="text-xs md:text-sm font-bold mb-1">
                    {item.title}
                  </h3>
                  <p className={`text-[10px] md:text-xs leading-relaxed ${theme.body} opacity-90`}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'standard':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
            <div className="flex flex-col justify-center p-6 md:p-10 space-y-4 md:space-y-6 relative z-10">
              <h2 className={`font-bold tracking-tight leading-tight ${isFullscreen ? 'text-3xl md:text-5xl' : 'text-xl md:text-3xl'} ${theme.title}`}>
                {slide.title}
              </h2>
              <div className="space-y-3">
                {contentData.body && (
                  <p className={`leading-relaxed ${isFullscreen ? 'text-base md:text-xl' : 'text-xs md:text-sm'} ${theme.body}`}>
                    {contentData.body}
                  </p>
                )}
                {contentData.bullets && contentData.bullets.length > 0 && (
                  <ul className="space-y-2">
                    {contentData.bullets.map((bullet, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isFullscreen ? 'text-base' : 'text-xs md:text-sm'} ${theme.body}`}>
                        <span className="mt-1.5 shrink-0 size-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="relative w-full h-full min-h-[150px] md:min-h-0">
              <img
                src={imageSrc}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
            </div>
          </div>
        )
    }
  }

  return (
    <div
      className={`overflow-hidden select-none border transition-all duration-300 ${
        isFullscreen ? 'w-full h-full bg-black border-none' : 'glass rounded-2xl'
      }`}
    >
      <div
        className={`relative ${theme.fontFamily} ${theme.gradientBg || theme.bg} ${theme.text} ${
          isFullscreen ? 'w-full h-full' : 'aspect-video'
        }`}
      >
        {/* Render background shapes/highlights if modern theme */}
        {!isFullscreen && (style === 'futuristic' || style === 'creative' || style === 'startup-pitch') && (
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_30%_30%,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        )}
        
        {renderLayout()}
      </div>
      {slide.notes && !isFullscreen && (
        <div className="p-3 border-t border-border/50 bg-muted/20">
          <p className="text-[10px] md:text-xs text-muted-foreground">
            <span className="font-semibold">Speaker Notes:</span> {slide.notes}
          </p>
        </div>
      )}
    </div>
  )
}
