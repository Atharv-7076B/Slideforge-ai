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

  // Calculate text density to scale typography dynamically (Task 2)
  const totalTextLength = (slide.title?.length || 0) + (contentData.body?.length || 0) + (contentData.bullets?.join('')?.length || 0)
  const isShortContent = totalTextLength < 180

  // Responsive font size builders
  const titleSizeClass = isShortContent
    ? (isFullscreen ? 'text-3xl md:text-5xl lg:text-6xl font-black' : 'text-2xl md:text-3xl font-black')
    : (isFullscreen ? 'text-2xl md:text-4xl lg:text-5xl font-extrabold' : 'text-lg md:text-2xl font-extrabold')

  const bodySizeClass = isShortContent
    ? (isFullscreen ? 'text-base md:text-xl lg:text-2xl leading-relaxed' : 'text-xs md:text-base leading-relaxed')
    : (isFullscreen ? 'text-sm md:text-lg leading-normal' : 'text-[10px] md:text-sm leading-normal')

  const spacingClass = isShortContent ? 'space-y-4 md:space-y-6' : 'space-y-2 md:space-y-4'

  // Helper to render the layout structure
  const renderLayout = () => {
    const layoutType = contentData.layoutType || 'standard'

    switch (layoutType) {
      case 'hero':
        return (
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Cinematic background image */}
            <img
              src={imageSrc}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover scale-[1.03] blur-[1px]"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/45" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.65))]" />
            
            {/* Glassmorphic card overlay */}
            <div className="relative z-10 max-w-3xl w-[90%] mx-auto p-6 md:p-10 rounded-2xl md:rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center space-y-4 md:space-y-6">
              {/* Decorative accent top line */}
              <div className="w-16 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${theme.accent}, #fb7185)` }} />
              
              <h2 className={`${titleSizeClass} tracking-tight leading-tight text-white`}>
                {slide.title}
              </h2>
              {contentData.body && (
                <p className={`${bodySizeClass} text-white/90 max-w-xl mx-auto`}>
                  {contentData.body}
                </p>
              )}
            </div>
          </div>
        )

      case 'split-left':
      case 'split-right':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full overflow-hidden">
            {/* Text/Content Column */}
            <div className={`flex flex-col justify-center p-6 md:p-10 ${spacingClass} ${layoutType === 'split-right' ? 'order-1 md:order-1' : 'order-2 md:order-2'} relative z-10`}>
              <h2 className={`${titleSizeClass} tracking-tight leading-tight ${theme.title}`}>
                {slide.title}
              </h2>
              <div className={spacingClass}>
                {contentData.body && (
                  <p className={`${bodySizeClass} leading-relaxed ${theme.body}`}>
                    {contentData.body}
                  </p>
                )}
                {contentData.bullets && contentData.bullets.length > 0 && (
                  <ul className="space-y-2 md:space-y-3">
                    {contentData.bullets.map((bullet, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 ${bodySizeClass} ${theme.body}`}>
                        <span className="mt-2 shrink-0 size-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: theme.accent }} />
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>
        )

      case 'full-image':
        return (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={imageSrc}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            
            {/* Overlay text card */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 max-w-2xl z-10">
              <div className="p-5 md:p-8 rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl shadow-2xl space-y-3 md:space-y-4">
                <h2 className="font-extrabold tracking-tight text-xl md:text-3xl text-white">
                  {slide.title}
                </h2>
                {contentData.body && (
                  <p className="text-white/90 leading-relaxed text-xs md:text-sm">
                    {contentData.body}
                  </p>
                )}
                {contentData.bullets && contentData.bullets.length > 0 && (
                  <ul className="space-y-1.5">
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
          <div className="relative w-full h-full overflow-hidden flex flex-col justify-center items-center">
            {/* Subtle background image watermark */}
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-15 blur-[2px] scale-[1.02]"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/30" />
            
            <div className="flex flex-col justify-center items-center text-center px-6 md:px-12 py-8 max-w-4xl mx-auto space-y-4 md:space-y-6 relative z-10">
              <span className="text-6xl md:text-8xl opacity-35 font-serif leading-none select-none" style={{ color: theme.accent }}>“</span>
              <h2 className={`font-medium italic leading-relaxed tracking-wide ${isFullscreen ? 'text-xl md:text-3xl lg:text-4xl' : 'text-xs md:text-lg'} ${theme.text}`}>
                {contentData.quoteText || contentData.body || slide.title}
              </h2>
              {contentData.quoteAuthor && (
                <div className="flex items-center gap-3 pt-2 justify-center">
                  <span className="w-8 h-px bg-current opacity-30" />
                  <span className={`text-xs md:text-base font-black tracking-wider uppercase ${theme.accentClass}`}>
                    {contentData.quoteAuthor}
                  </span>
                  <span className="w-8 h-px bg-current opacity-30" />
                </div>
              )}
            </div>
          </div>
        )

      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full overflow-hidden">
            {/* Metric Panel */}
            <div className="flex flex-col justify-center p-6 md:p-8 space-y-4 relative z-10 overflow-y-auto max-h-full">
              <h2 className={`${titleSizeClass} tracking-tight leading-tight ${theme.title}`}>
                {slide.title}
              </h2>
              {contentData.body && (
                <p className={`${bodySizeClass} leading-relaxed ${theme.body}`}>
                  {contentData.body}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                {contentData.stats?.map((stat, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${theme.card} flex flex-col justify-center transition-all duration-300 hover:border-white/10 hover:shadow-lg`}>
                    <span className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight" style={{ color: theme.accent }}>
                      {stat.value}
                    </span>
                    <span className={`text-[9px] md:text-xs font-semibold mt-1 uppercase tracking-wider ${theme.body} opacity-85`}>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full overflow-hidden">
            {/* Grid Items Panel */}
            <div className="flex flex-col justify-center p-6 md:p-8 space-y-4 relative z-10 overflow-y-auto max-h-full">
              <div className="space-y-1">
                <h2 className={`${titleSizeClass} tracking-tight leading-tight ${theme.title}`}>
                  {slide.title}
                </h2>
                {contentData.body && (
                  <p className={`${bodySizeClass} leading-relaxed ${theme.body} opacity-90`}>
                    {contentData.body}
                  </p>
                )}
              </div>
              
              <div className="space-y-2 md:space-y-3">
                {contentData.gridItems?.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${theme.card} flex items-start gap-3 transition-transform duration-200 hover:scale-[1.01]`}>
                    <div className="size-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-xs md:text-sm font-bold">
                        {item.title}
                      </h3>
                      <p className={`text-[10px] md:text-xs leading-relaxed ${theme.body} opacity-80`}>
                        {item.description}
                      </p>
                    </div>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>
        )

      case 'standard':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full overflow-hidden">
            <div className={`flex flex-col justify-center p-6 md:p-10 ${spacingClass} relative z-10`}>
              <h2 className={`${titleSizeClass} tracking-tight leading-tight ${theme.title}`}>
                {slide.title}
              </h2>
              <div className={spacingClass}>
                {contentData.body && (
                  <p className={`${bodySizeClass} leading-relaxed ${theme.body}`}>
                    {contentData.body}
                  </p>
                )}
                {contentData.bullets && contentData.bullets.length > 0 && (
                  <ul className="space-y-2">
                    {contentData.bullets.map((bullet, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 ${bodySizeClass} ${theme.body}`}>
                        <span className="mt-2 shrink-0 size-2 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: theme.accent }} />
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
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
        className={`relative overflow-hidden ${theme.fontFamily} ${theme.gradientBg || theme.bg} ${theme.text} ${
          isFullscreen ? 'w-full h-full' : 'aspect-video'
        }`}
      >
        {/* Background visual gradient mesh (Task 2) */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full filter blur-[120px]" style={{ background: `radial-gradient(circle, ${theme.accent}40 0%, transparent 80%)` }} />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full filter blur-[120px]" style={{ background: `radial-gradient(circle, ${theme.accent}30 0%, transparent 80%)` }} />
        </div>

        {renderLayout()}
      </div>
      {slide.notes && !isFullscreen && (
        <div className="p-3 border-t border-border/50 bg-muted/10 backdrop-blur-xs">
          <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground/80">Speaker Notes:</span> {slide.notes}
          </p>
        </div>
      )}
    </div>
  )
}
