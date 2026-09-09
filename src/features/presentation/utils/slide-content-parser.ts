export type SlideStatMetric = {
  value: string
  label: string
  type?: 'metric' | string
}

export type SlideContentData = {
  layoutType: 'hero' | 'split-left' | 'split-right' | 'full-image' | 'quote' | 'stats' | 'grid' | 'standard'
  body?: string
  bullets?: string[]
  quoteText?: string
  quoteAuthor?: string
  stats?: SlideStatMetric[]
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
    body: 'Explore the key insights, objectives, and parameters detailing this section of the presentation.',
    bullets: [
      'Strategic alignment and executive roadmap definition',
      'Data-driven performance insights and scaling models',
      'Operational excellence and continuous optimization loops'
    ]
  }

  if (!content) {
    return fallbackData;
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

    // Sanitize stats: preserve structured numerical values strictly
    let stats: SlideStatMetric[] | undefined = undefined
    if (Array.isArray(parsedData.stats)) {
      stats = parsedData.stats.map((s: any) => {
        if (!s || typeof s !== 'object') {
          return { value: '0', label: 'Metric', type: 'metric' }
        }

        let rawVal = s.value !== null && s.value !== undefined ? String(s.value).trim() : ''
        let rawLabel = s.label !== null && s.label !== undefined ? String(s.label).trim() : ''

        // If label is missing but value contains a composite phrase (e.g. "3X Faster" or "95% Accuracy")
        if (!rawLabel && rawVal) {
          const metricMatch = rawVal.match(
            /^([$€£¥]?\s*[-+]?\d+(?:[.,]\d+)?\s*[%xXkKmMbBtT+]?|\b\d+X\b|\b\d+%\b)(?:\s*[-–—:]?\s*)(.*)$/i
          )
          if (metricMatch && metricMatch[1] && metricMatch[2]) {
            rawVal = metricMatch[1].trim()
            rawLabel = metricMatch[2].trim()
          } else {
            rawLabel = 'Metric'
          }
        }

        return {
          value: rawVal || '0',
          label: rawLabel || 'Metric',
          type: 'metric' as const,
        }
      })
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

    // Layout-specific fallbacks to guarantee rich elements
    if (layoutType === 'hero') {
      body = body || 'Unlocking next-generation possibilities through smart synthesis, structured planning, and AI-driven solutions.'
    }

    if (layoutType === 'quote') {
      quoteText = quoteText || body || 'Vision is the art of seeing what is invisible to others.'
      quoteAuthor = quoteAuthor || 'Executive Perspective'
    }

    if (layoutType === 'stats') {
      if (!stats || stats.length === 0) {
        stats = [
          { value: '85%', label: 'Efficiency and throughput optimization', type: 'metric' },
          { value: '3.5x', label: 'Acceleration in pipeline processing velocity', type: 'metric' },
          { value: '100%', label: 'Enterprise reliability and performance grade', type: 'metric' }
        ]
      }
      body = body || 'Key performance benchmarks and quantitative milestones achieved during the implementation cycle.'
    }

    if (layoutType === 'grid') {
      if (!gridItems || gridItems.length === 0) {
        gridItems = [
          { title: 'Core Innovation', description: 'Leveraging frontier architectures to design scalable systems.' },
          { title: 'Intelligent Automation', description: 'Streamlining repetitive processes with state-of-the-art AI agents.' },
          { title: 'Seamless Integration', description: 'Connecting existing legacy infrastructure with cloud-native workflows.' }
        ]
      }
      body = body || 'Three key architectural pillars supporting the foundational strategy.'
    }

    if (layoutType === 'split-left' || layoutType === 'split-right' || layoutType === 'standard' || layoutType === 'full-image') {
      if (!body && (!bullets || bullets.length === 0)) {
        body = 'This section details the core operational mechanics and strategic alignment parameters.'
        bullets = [
          'Robust framework modeling and deployment specifications',
          'Intelligent data mapping and analytics interfaces',
          'Continuous telemetry monitoring and feedback cycles'
        ]
      }
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
    body: finalBody || 'Explore the operational strategy and core metrics within this section.',
    bullets: bullets.length > 0 ? bullets : [
      'Strategic alignment and execution roadmap development',
      'Advanced platform scalability and design principles',
      'Unified data flow modeling and telemetry analytics'
    ],
  }
}
