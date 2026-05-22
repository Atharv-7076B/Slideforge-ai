import pptxgen from 'pptxgenjs'
import { getTheme } from './theme-mapper'
import { parseSlideContent } from './slide-content-parser'
import { getPlaceholderImage } from './placeholder-mapper'

type Slide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
}

/**
 * Generates and downloads a PowerPoint presentation file.
 * The PowerPoint is styled to match the selected layout engine and color theme.
 */
export async function exportPresentationToPPTX(
  title: string,
  style: string,
  slides: Slide[],
): Promise<void> {
  const pptx = new pptxgen()
  pptx.layout = 'LAYOUT_16x9'

  const theme = getTheme(style)
  // Strip '#' from hex colors for pptxgenjs compatibility
  const bgColor = theme.pptxBg.replace('#', '')
  const textColor = theme.pptxText.replace('#', '')
  const titleColor = theme.pptxTitle.replace('#', '')
  const accentColor = theme.pptxAccent.replace('#', '')
  const cardColor = theme.pptxCard.replace('#', '')
  const cardBorderColor = theme.pptxCardBorder.replace('#', '')
  
  const fontName = theme.fontFamily === 'font-mono' ? 'Courier New' : (theme.fontFamily === 'font-serif' ? 'Georgia' : 'Calibri')

  console.log('[PPTX Export] Starting export for presentation:', title, 'style:', style, 'slides:', slides.length)

  // 1. Cover / Hero Slide
  const coverSlide = pptx.addSlide()
  coverSlide.background = { fill: bgColor }

  // Draw top color bar
  coverSlide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.15,
    fill: { color: accentColor },
  })

  // Large centered presentation title
  coverSlide.addText(title, {
    x: 1.0,
    y: 1.5,
    w: 8.0,
    h: 1.6,
    fontSize: 40,
    fontFace: fontName,
    color: titleColor,
    bold: true,
    align: 'center',
    valign: 'middle',
  })

  // Decorative accent line
  coverSlide.addShape(pptx.shapes.RECTANGLE, {
    x: 4.0,
    y: 3.3,
    w: 2.0,
    h: 0.04,
    fill: { color: accentColor },
  })

  // Subtitle
  coverSlide.addText('SlideForge AI Presentation Engine', {
    x: 1.0,
    y: 3.6,
    w: 8.0,
    h: 0.8,
    fontSize: 16,
    fontFace: fontName,
    color: textColor,
    align: 'center',
    italic: true,
  })

  // 2. Individual Content Slides
  slides.forEach((slide, index) => {
    const pptxSlide = pptx.addSlide()
    pptxSlide.background = { fill: bgColor }

    const contentData = parseSlideContent(slide.content)
    const layoutType = contentData.layoutType || 'standard'

    // Determine the image path
    let imagePath = slide.imageUrl || getPlaceholderImage(slide.title, slide.content || '')
    if (imagePath.startsWith('/')) {
      imagePath = window.location.origin + imagePath
    }

    // Process layout types
    switch (layoutType) {
      case 'hero': {
        // Full bleed background image
        pptxSlide.addImage({
          path: imagePath,
          x: 0,
          y: 0,
          w: 10,
          h: 5.625,
        })

        // Draw transparent glassmorphic overlay box
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: 1.5,
          y: 1.1,
          w: 7.0,
          h: 3.425,
          fill: { color: cardColor, transparency: 15 },
          line: { color: cardBorderColor, width: 1.5 },
        })

        // Title inside the overlay box
        pptxSlide.addText(slide.title, {
          x: 1.7,
          y: 1.3,
          w: 6.6,
          h: 1.3,
          fontSize: 30,
          fontFace: fontName,
          color: 'FFFFFF', // Premium high contrast white text for dark glass overlay
          bold: true,
          align: 'center',
          valign: 'middle',
        })

        // Body text inside the overlay box
        if (contentData.body) {
          pptxSlide.addText(contentData.body, {
            x: 1.7,
            y: 2.7,
            w: 6.6,
            h: 1.5,
            fontSize: 14,
            fontFace: fontName,
            color: 'ECEFF1',
            align: 'center',
            valign: 'top',
          })
        }
        break
      }

      case 'split-left':
      case 'split-right': {
        const isLeft = layoutType === 'split-left'
        const textX = isLeft ? 5.3 : 0.6
        const textW = 4.1
        const imgX = isLeft ? 0 : 5.0
        const imgW = 5.0

        // Full bleed split image
        pptxSlide.addImage({
          path: imagePath,
          x: imgX,
          y: 0,
          w: imgW,
          h: 5.625,
        })

        // Title
        pptxSlide.addText(slide.title, {
          x: textX,
          y: 0.6,
          w: textW,
          h: 0.9,
          fontSize: 24,
          fontFace: fontName,
          color: titleColor,
          bold: true,
          valign: 'bottom',
        })

        // Content
        const runs: any[] = []
        if (contentData.body) {
          runs.push({ text: contentData.body + '\n\n', options: { fontSize: 13, color: textColor, breakLine: true } })
        }
        if (contentData.bullets && contentData.bullets.length > 0) {
          contentData.bullets.forEach((b) => {
            runs.push({
              text: b,
              options: { bullet: true, fontSize: 12, color: textColor, breakLine: true, paraSpaceBefore: 4 },
            })
          })
        }

        pptxSlide.addText(runs, {
          x: textX,
          y: 1.7,
          w: textW,
          h: 3.2,
          fontFace: fontName,
          valign: 'top',
        })
        break
      }

      case 'full-image': {
        // Background image full size
        pptxSlide.addImage({
          path: imagePath,
          x: 0,
          y: 0,
          w: 10,
          h: 5.625,
        })

        // Draw card overlay container with transparency
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: 0.6,
          y: 1.6,
          w: 5.6,
          h: 3.2,
          fill: { color: cardColor, transparency: 10 },
          line: { color: cardBorderColor, width: 1.5 },
        })

        // Card Title
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 1.8,
          w: 5.2,
          h: 0.6,
          fontSize: 22,
          fontFace: fontName,
          color: 'FFFFFF', // Default high contrast text for dark glass card
          bold: true,
        })

        // Card Content
        const runs: any[] = []
        if (contentData.body) {
          runs.push({ text: contentData.body + '\n\n', options: { fontSize: 13, color: 'ECEFF1', breakLine: true } })
        }
        if (contentData.bullets && contentData.bullets.length > 0) {
          contentData.bullets.forEach((b) => {
            runs.push({
              text: b,
              options: { bullet: true, fontSize: 12, color: 'CFD8DC', breakLine: true, paraSpaceBefore: 4 },
            })
          })
        }

        pptxSlide.addText(runs, {
          x: 0.8,
          y: 2.5,
          w: 5.2,
          h: 2.1,
          fontFace: fontName,
          valign: 'top',
        })
        break
      }

      case 'quote': {
        // Decorative Quote mark
        pptxSlide.addText('“', {
          x: 1.0,
          y: 0.8,
          w: 8.0,
          h: 0.8,
          fontSize: 72,
          fontFace: 'Georgia',
          color: accentColor,
          align: 'center',
        })

        // Quote text
        pptxSlide.addText(contentData.quoteText || contentData.body || slide.title, {
          x: 1.0,
          y: 1.7,
          w: 8.0,
          h: 2.2,
          fontSize: 20,
          fontFace: fontName,
          color: textColor,
          italic: true,
          align: 'center',
          valign: 'middle',
        })

        // Quote author attribution
        if (contentData.quoteAuthor) {
          pptxSlide.addText(`— ${contentData.quoteAuthor}`, {
            x: 1.0,
            y: 4.0,
            w: 8.0,
            h: 0.6,
            fontSize: 14,
            fontFace: fontName,
            color: accentColor,
            bold: true,
            align: 'center',
          })
        }
        break
      }

      case 'stats': {
        // Title
        pptxSlide.addText(slide.title, {
          x: 0.6,
          y: 0.5,
          w: 4.4,
          h: 0.8,
          fontSize: 24,
          fontFace: fontName,
          color: titleColor,
          bold: true,
        })

        if (contentData.body) {
          pptxSlide.addText(contentData.body, {
            x: 0.6,
            y: 1.4,
            w: 4.4,
            h: 1.1,
            fontSize: 13,
            fontFace: fontName,
            color: textColor,
            valign: 'top',
          })
        }

        // Draw Stat boxes side-by-side
        if (contentData.stats && contentData.stats.length > 0) {
          contentData.stats.slice(0, 2).forEach((stat, idx) => {
            const sX = 0.6 + (idx * 2.3)

            // Background card box
            pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
              x: sX,
              y: 2.7,
              w: 2.1,
              h: 1.5,
              fill: { color: cardColor },
              line: { color: cardBorderColor, width: 1 },
            })

            // Metric Value
            pptxSlide.addText(stat.value, {
              x: sX + 0.1,
              y: 2.8,
              w: 1.9,
              h: 0.6,
              fontSize: 30,
              fontFace: fontName,
              color: accentColor,
              bold: true,
              align: 'center',
            })

            // Metric Label
            pptxSlide.addText(stat.label, {
              x: sX + 0.1,
              y: 3.45,
              w: 1.9,
              h: 0.6,
              fontSize: 10,
              fontFace: fontName,
              color: textColor,
              align: 'center',
              valign: 'top',
            })
          })
        }

        // Side Image - Widescreen 16:9 aspect ratio
        pptxSlide.addImage({
          path: imagePath,
          x: 5.3,
          y: 1.5,
          w: 4.1,
          h: 2.3,
        })
        break
      }

      case 'grid': {
        // Title
        pptxSlide.addText(slide.title, {
          x: 0.6,
          y: 0.5,
          w: 8.8,
          h: 0.7,
          fontSize: 24,
          fontFace: fontName,
          color: titleColor,
          bold: true,
        })

        if (contentData.body) {
          pptxSlide.addText(contentData.body, {
            x: 0.6,
            y: 1.25,
            w: 8.8,
            h: 0.5,
            fontSize: 13,
            fontFace: fontName,
            color: textColor,
            valign: 'top',
          })
        }

        // Draw 3 grids
        if (contentData.gridItems && contentData.gridItems.length > 0) {
          contentData.gridItems.slice(0, 3).forEach((item, idx) => {
            const boxX = 0.6 + (idx * 3.1)

            // Rounded rectangle container
            pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
              x: boxX,
              y: 1.9,
              w: 2.6,
              h: 2.9,
              fill: { color: cardColor },
              line: { color: cardBorderColor, width: 1 },
            })

            // Index Bubble Background
            pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
              x: boxX + 0.2,
              y: 2.1,
              w: 0.4,
              h: 0.4,
              fill: { color: accentColor, transparency: 85 },
            })

            // Index Number
            pptxSlide.addText(String(idx + 1), {
              x: boxX + 0.2,
              y: 2.1,
              w: 0.4,
              h: 0.4,
              fontSize: 11,
              fontFace: fontName,
              color: accentColor,
              bold: true,
              align: 'center',
              valign: 'middle',
            })

            // Grid Title
            pptxSlide.addText(item.title, {
              x: boxX + 0.2,
              y: 2.65,
              w: 2.2,
              h: 0.45,
              fontSize: 13,
              fontFace: fontName,
              color: textColor,
              bold: true,
            })

            // Grid Description
            pptxSlide.addText(item.description, {
              x: boxX + 0.2,
              y: 3.15,
              w: 2.2,
              h: 1.45,
              fontSize: 11,
              fontFace: fontName,
              color: textColor,
              valign: 'top',
            })
          })
        }
        break
      }

      case 'standard':
      default: {
        // Title
        pptxSlide.addText(slide.title, {
          x: 0.6,
          y: 0.5,
          w: 4.4,
          h: 0.8,
          fontSize: 24,
          fontFace: fontName,
          color: titleColor,
          bold: true,
        })

        // Standard Text runs
        const runs: any[] = []
        if (contentData.body) {
          runs.push({ text: contentData.body + '\n\n', options: { fontSize: 13, color: textColor, breakLine: true } })
        }
        if (contentData.bullets && contentData.bullets.length > 0) {
          contentData.bullets.forEach((b) => {
            runs.push({
              text: b,
              options: { bullet: true, fontSize: 12, color: textColor, breakLine: true, paraSpaceBefore: 4 },
            })
          })
        }

        pptxSlide.addText(runs, {
          x: 0.6,
          y: 1.4,
          w: 4.4,
          h: 3.4,
          fontFace: fontName,
          valign: 'top',
        })

        // Standard Slide Image - Widescreen 16:9 aspect ratio
        pptxSlide.addImage({
          path: imagePath,
          x: 5.3,
          y: 1.5,
          w: 4.1,
          h: 2.3,
        })
        break
      }
    }

    // Add footer page tracking
    pptxSlide.addText('SlideForge AI', {
      x: 0.6,
      y: 5.15,
      w: 4.0,
      h: 0.3,
      fontSize: 9,
      fontFace: fontName,
      color: textColor,
      italic: true,
      opacity: 70,
    })

    pptxSlide.addText(`Slide ${index + 1} of ${slides.length}`, {
      x: 5.4,
      y: 5.15,
      w: 4.0,
      h: 0.3,
      fontSize: 9,
      fontFace: fontName,
      color: textColor,
      align: 'right',
      opacity: 70,
    })

    // Attach speaker notes
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes)
    }
  })

  // 3. Save PPTX File
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'presentation'
  const fileName = `${safeTitle}.pptx`
  console.log('[PPTX Export] Saving presentation to file:', fileName)
  await pptx.writeFile({ fileName })
  console.log('[PPTX Export] PowerPoint file saved successfully.')
}
