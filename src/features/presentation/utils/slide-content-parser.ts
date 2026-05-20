export type SlideContentData = {
  layoutType: 'hero' | 'split-left' | 'split-right' | 'full-image' | 'quote' | 'stats' | 'grid' | 'standard'
  body?: string
  bullets?: string[]
  quoteText?: string
  quoteAuthor?: string
  stats?: Array<{ value: string; label: string }>
  gridItems?: Array<{ title: string; description: string }>
}

/**
 * Parses the slide content string. If the string is a valid JSON structure matching SlideContentData,
 * it parses and returns it. Otherwise, it parses it as plain text and maps it to a standard layout
 * structure for backward compatibility.
 */
export function parseSlideContent(content: string): SlideContentData {
  const fallbackData: SlideContentData = { 
    layoutType: 'standard', 
    body: 'Slide content is currently unavailable.' 
  }

  if (!content) {
    return fallbackData
  }

  const trimmed = content.trim()
  let parsedData: any = null

  // Quick check if it could be JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      parsedData = JSON.parse(trimmed)
    } catch {
      // Fall through to plain text parsing
    }
  }

  if (parsedData && typeof parsedData === 'object') {
    // Sanitize layoutType
    let layoutType = parsedData.layoutType
    const allowedLayouts = ['hero', 'split-left', 'split-right', 'full-image', 'quote', 'stats', 'grid', 'standard']
    if (!allowedLayouts.includes(layoutType)) {
      layoutType = 'standard'
    }

    // Sanitize body
    let body = parsedData.body
    if (body === null || body === undefined) {
      body = ''
    } else {
      body = String(body)
    }

    // Sanitize bullets
    let bullets = parsedData.bullets
    if (Array.isArray(bullets)) {
      bullets = bullets.map(b => b === null || b === undefined ? '' : String(b)).filter(Boolean)
      if (bullets.length === 0) bullets = undefined
    } else {
      bullets = undefined
    }

    // Sanitize quoteText & quoteAuthor
    let quoteText = parsedData.quoteText
    if (quoteText === null || quoteText === undefined) {
      quoteText = ''
    } else {
      quoteText = String(quoteText)
    }

    let quoteAuthor = parsedData.quoteAuthor
    if (quoteAuthor === null || quoteAuthor === undefined) {
      quoteAuthor = ''
    } else {
      quoteAuthor = String(quoteAuthor)
    }

    // Sanitize stats
    let stats = parsedData.stats
    if (Array.isArray(stats)) {
      stats = stats.map(s => {
        if (!s || typeof s !== 'object') return { value: '0', label: 'Metric' }
        return {
          value: s.value !== null && s.value !== undefined ? String(s.value) : '0',
          label: s.label !== null && s.label !== undefined ? String(s.label) : 'Metric'
        }
      })
    } else {
      stats = undefined
    }

    // Sanitize gridItems
    let gridItems = parsedData.gridItems
    if (Array.isArray(gridItems)) {
      gridItems = gridItems.map(g => {
        if (!g || typeof g !== 'object') return { title: 'Pillar', description: 'Description' }
        return {
          title: g.title !== null && g.title !== undefined ? String(g.title) : 'Pillar',
          description: g.description !== null && g.description !== undefined ? String(g.description) : 'Description'
        }
      })
    } else {
      gridItems = undefined
    }

    // Post-sanitize checks based on layout type to ensure we have content!
    if (layoutType === 'quote' && !quoteText) {
      quoteText = body || 'No quote content generated.'
      quoteAuthor = quoteAuthor || 'Author'
    }

    if (layoutType === 'stats' && (!stats || stats.length === 0)) {
      stats = [
        { value: '50%', label: 'Key metric progress indicator' },
        { value: '24/7', label: 'Operational availability status' }
      ]
    }

    if (layoutType === 'grid' && (!gridItems || gridItems.length === 0)) {
      gridItems = [
        { title: 'Core Feature 1', description: 'Detailed feature description and value proposition' },
        { title: 'Core Feature 2', description: 'Detailed feature description and value proposition' },
        { title: 'Core Feature 3', description: 'Detailed feature description and value proposition' }
      ]
    }

    // Standard fallback if both body and bullets are completely empty
    if (layoutType === 'standard' && !body && (!bullets || bullets.length === 0)) {
      body = 'Key insights and summary metrics are shown on this page.'
    }

    return {
      layoutType,
      body,
      bullets,
      quoteText,
      quoteAuthor,
      stats,
      gridItems
    }
  }

  // Legacy plain-text parsing
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean)
  const bullets = lines
    .filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'))
    .map((l) => l.replace(/^[•\-*]\s*/, ''))
  const nonBullets = lines.filter((l) => !l.startsWith('•') && !l.startsWith('-') && !l.startsWith('*'))

  const finalBody = nonBullets.join('\n\n')
  return {
    layoutType: 'standard',
    body: finalBody || 'No slide content text available.',
    bullets: bullets.length > 0 ? bullets : undefined,
  }
}
