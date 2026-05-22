import { prisma } from '#/lib/db'
import { inngest } from './client'
import { z } from 'zod'
import { Output, generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { PresentationStatus } from '@prisma/client'

function validateRequiredAiEnv(): void {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('Missing required env var: GOOGLE_GENERATIVE_AI_API_KEY')
  }
}

function getImageKitConfig() {
  return {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? '',
    urlEndpoint:
      process.env.IMAGEKIT_URL_ENDPOINT ?? process.env.IMAGEKIT_BASE_URL ?? '',
  }
}

function validateImageKitConfigOrThrow() {
  const { publicKey, privateKey, urlEndpoint } = getImageKitConfig()
  const missing: string[] = []

  if (!publicKey) missing.push('IMAGEKIT_PUBLIC_KEY')
  if (!privateKey) missing.push('IMAGEKIT_PRIVATE_KEY')
  if (!urlEndpoint) missing.push('IMAGEKIT_URL_ENDPOINT (or IMAGEKIT_BASE_URL)')

  if (missing.length > 0) {
    throw new Error(
      `Missing required ImageKit env var(s): ${missing.join(', ')}`,
    )
  }

  const parsed = new URL(urlEndpoint)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('IMAGEKIT_URL_ENDPOINT must use http or https')
  }
  if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
    throw new Error('IMAGEKIT_URL_ENDPOINT cannot use localhost')
  }
}

function sanitizeFileName(name: string): string {
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return safe || 'slide-image'
}

async function runDbQueryWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError: any
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message : String(err)
      const code = (err as any)?.code
      const isPoolTimeout = 
        msg.includes('Timed out fetching a new connection') || 
        msg.includes('connection pool') ||
        msg.includes('closed the connection') ||
        code === 'P2024' ||
        code === 'P2025' ||
        msg.includes('Server has closed the connection')

      if (isPoolTimeout && i < retries - 1) {
        console.warn(`[Prisma DB Retry] Transient database error detected (Code: ${code}, Msg: ${msg}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`)
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
        continue
      }
      throw err
    }
  }
  throw lastError
}

function getBasicAuthHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`
}

async function checkImageKitAvailability(): Promise<boolean> {
  try {
    const { publicKey, urlEndpoint, privateKey } = getImageKitConfig()
    console.log('[ImageKit Diagnostics] Configuration parameters loaded:', {
      publicKey: publicKey ? 'SET' : 'MISSING',
      urlEndpoint: urlEndpoint || 'MISSING',
      privateKey: privateKey ? `SET (Length: ${privateKey.length})` : 'MISSING',
    })

    validateImageKitConfigOrThrow()

    console.log('[ImageKit Diagnostics] Executing probe request to ImageKit Upload API...')
    const response = await fetch(
      'https://upload.imagekit.io/api/v1/files/upload',
      {
        method: 'POST',
        headers: {
          Authorization: getBasicAuthHeader(privateKey),
        },
      },
    )

    console.log('[ImageKit Diagnostics] Probe response status:', response.status, response.statusText)

    if (!response.ok) {
      // 400 is expected due to missing form body; means auth + endpoint are reachable.
      if (response.status === 400) {
        console.log('[ImageKit Diagnostics] Probe successful: Auth details are correct and API is reachable.')
        return true
      }
      if (response.status === 401 || response.status === 403) {
        console.error('[ImageKit Diagnostics] Critical error: ImageKit Auth probe rejected. Invalid keys.')
        return false
      }
      // Any other non-ok HTTP status (e.g., 429, 502) - since config is present, assume availability to try slide-by-slide
      console.warn('[ImageKit Diagnostics] Probe returned unexpected non-ok status, but env config is set. Proceeding.')
      return true
    }
    return true
  } catch (error) {
    console.warn('[ImageKit Diagnostics] Warning: Probe request failed with connection exception, but proceeding since config is set:', error)
    // If it is a network error (like ENOTFOUND or offline), return true if configuration variables are set
    const { publicKey, privateKey, urlEndpoint } = getImageKitConfig()
    return !!(publicKey && privateKey && urlEndpoint)
  }
}

import { getPlaceholderImage } from '#/features/presentation/utils/placeholder-mapper'

async function generateImageFromPrompt(prompt: string): Promise<string | null> {
  const hfToken = process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN
  if (!hfToken) {
    console.error('[HF Image Generation] Error: Missing HF_TOKEN or HUGGINGFACE_API_KEY environment variable.')
    return null
  }

  // Environment toggle check
  if (process.env.VITE_USE_REAL_AI_IMAGES !== 'true') {
    console.log('[HF Image Generation] Real AI images are disabled (VITE_USE_REAL_AI_IMAGES !== true). Bypassing HF API call.')
    return null
  }

  const API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"

  try {
    console.log('[HF Image Generation] Starting API call to:', API_URL)
    console.log('[HF Image Generation] Prompt:', prompt)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 1024,
          height: 576,
          num_inference_steps: 4,
        },
      }),
    })

    console.log('[HF Image Generation] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorBody = await response.text()
      const errorMsg = `Hugging Face image generation failed (${response.status}): ${errorBody.slice(0, 300)}`
      console.error('[HF Image Generation] Error:', errorMsg)
      return null
    }

    // Validate Content-Type
    const contentType = response.headers.get('content-type')
    console.log('[HF Image Generation] Response content-type:', contentType)
    if (contentType && !contentType.includes('image')) {
      const errorText = await response.text()
      console.error(`[HF Image Generation] Error: Non-image content-type returned (${contentType}):`, errorText.slice(0, 300))
      return null
    }

    // Hugging Face returns binary image data
    const buffer = await response.arrayBuffer()
    if (!buffer || buffer.byteLength === 0) {
      console.error('[HF Image Generation] Error: Received empty image buffer')
      return null
    }

    // Convert buffer to base64
    const b64 = Buffer.from(buffer).toString('base64')
    console.log(
      '[HF Image Generation] Successfully generated image, size:',
      buffer.byteLength,
      'bytes',
    )

    return b64
  } catch (error) {
    console.error('[HF Image Generation] Connection/Fetch failed:', error)
    return null
  }
}

function getStylePromptPrefix(style: string | null | undefined): string {
  const t = style?.toLowerCase() || 'modern'
  switch (t) {
    case 'futuristic':
      return 'Futuristic synthwave 3D render, holographic glows, cyberpunk neon lights, dark high-tech background, cinematic lighting, 16:9 aspect ratio, masterwork illustration'
    case 'creative':
      return 'Artistic high-contrast digital illustration, vibrant warm color scheme, creative metaphoric design, editorial style, cinematic depth, 16:9 aspect ratio, stunning graphic'
    case 'startup-pitch':
      return 'Sleek, modern minimalist venture capitalist presentation graphic, clean lines, premium workspace aesthetic, high-end professional design, subtle peach and slate accents, 16:9'
    case 'bold':
      return 'Bold high-contrast geometric artwork, striking color blocking, clean professional graphic design, modern typography-friendly art, high impact visual, 16:9 aspect ratio'
    case 'minimalist':
    case 'minimal':
      return 'Elegant clean minimalist design, spacious layout, premium monochrome with subtle warm undertone accent, professional line art or low poly graphic, 16:9 widescreen'
    case 'education':
      return 'Engaging clean informational vector illustration, bright modern color palette, educational presentation style, conceptual diagrams, 16:9 widescreen'
    case 'dark-mode':
      return 'Cinematic dark mode presentation illustration, deep dark slate backdrop, glowing elegant highlights, premium tech brand aesthetic, moody lighting, 16:9 aspect ratio'
    case 'professional':
    case 'corporate':
    default:
      return 'Professional corporate business presentation slide infographic art, premium clean abstract shapes, corporate amber and dark slate color scheme, high quality, 16:9 aspect ratio'
  }
}

async function createSlideImageAndUpload(params: {
  presentationId: string
  slideOrder: number
  imagePrompt: string
  slideTitle: string
  slideContent: string
  style?: string | null
}): Promise<string> {
  try {
    console.log('[Image Pipeline] Starting generation and upload', {
      presentationId: params.presentationId,
      slideOrder: params.slideOrder,
      promptPreview: params.imagePrompt.slice(0, 80),
    })

    const prefix = getStylePromptPrefix(params.style)
    const enrichedPrompt = `${prefix}. ${params.imagePrompt}. High quality, presentation visual, no text, no letters, no logos, 16:9 aspect ratio.`

    const base64Image = await generateImageFromPrompt(enrichedPrompt)
    if (!base64Image) {
      console.warn('[Image Pipeline] Image generation bypassed or failed. Falling back to placeholder.')
      const fallback = getPlaceholderImage(params.slideTitle, params.slideContent, params.imagePrompt)
      console.log(`[Image Pipeline] Using fallback placeholder for slide ${params.slideOrder}: ${fallback}`)
      return fallback
    }

    const fileName = sanitizeFileName(
      `slide-${params.presentationId}-${params.slideOrder}`,
    )

    console.log('[Image Pipeline] Image generated, uploading base64 to ImageKit', {
      fileName,
      sizeBytes: base64Image.length,
    })

    const imageUrl = await uploadBase64ToImageKit({
      base64Image,
      fileName,
      folderPath: `/presentations/${sanitizeFileName(params.presentationId)}`,
    })

    console.log('[Image Pipeline] Successfully completed upload flow', {
      presentationId: params.presentationId,
      slideOrder: params.slideOrder,
      imageUrl,
    })

    return imageUrl
  } catch (error) {
    console.error('[Image Pipeline] Slide image generation/upload failed. Falling back to placeholder.', {
      presentationId: params.presentationId,
      slideOrder: params.slideOrder,
      error: error instanceof Error ? error.message : String(error),
    })
    const fallback = getPlaceholderImage(params.slideTitle, params.slideContent, params.imagePrompt)
    console.log(`[Image Pipeline] Using fallback placeholder for slide ${params.slideOrder}: ${fallback}`)
    return fallback
  }
}

async function uploadBase64ToImageKit(params: {
  base64Image: string
  fileName: string
  folderPath: string
}): Promise<string> {
  validateImageKitConfigOrThrow()
  const { privateKey } = getImageKitConfig()

  console.log('[ImageKit Upload] Uploading to folder:', params.folderPath, 'file:', params.fileName)

  const formData = new FormData()
  formData.append('file', `data:image/png;base64,${params.base64Image}`)
  formData.append('fileName', `${params.fileName}.png`)
  formData.append('folder', params.folderPath)
  formData.append('useUniqueFileName', 'false')

  // Retry logic for ImageKit uploads (up to 2 retries with a backoff)
  let lastError: any
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        'https://upload.imagekit.io/api/v1/files/upload',
        {
          method: 'POST',
          headers: {
            Authorization: getBasicAuthHeader(privateKey),
          },
          body: formData,
        },
      )

      if (!response.ok) {
        const body = await response.text()
        const errMsg = `ImageKit upload failed (${response.status}): ${body.slice(0, 300)}`
        console.error(`[ImageKit Upload] Attempt ${attempt} failed:`, errMsg)
        throw new Error(errMsg)
      }

      const payload = (await response.json()) as { url?: string }
      const url = payload.url?.trim()
      if (!url) {
        console.error('[ImageKit Upload] Error: ImageKit upload succeeded but no URL returned')
        throw new Error('ImageKit upload succeeded but no URL returned')
      }

      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        console.error('[ImageKit Upload] Error: ImageKit returned non-http(s) URL:', url)
        throw new Error('ImageKit returned non-http(s) URL')
      }

      console.log('[ImageKit Upload] Successfully uploaded to ImageKit on attempt', attempt, 'URL:', parsed.toString())
      return parsed.toString()
    } catch (error) {
      lastError = error
      if (attempt < 3) {
        const waitTime = attempt * 1000
        console.log(`[ImageKit Upload] Waiting ${waitTime}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}



const slideSchema = z.object({
  heading: z.string().describe('Concise slide title (max 6-8 words)'),
  layoutType: z.enum([
    'hero',
    'split-left',
    'split-right',
    'full-image',
    'quote',
    'stats',
    'grid',
    'standard'
  ]).describe('Intelligent layout choice to pace the storytelling. hero: intro/outro; split: text + image; full-image: visual focus; quote: key insight statement; stats: 2-3 metric highlights; grid: 3 feature pillars; standard: general text.'),
  body: z.string().optional().describe('Main storytelling text. Keep it punchy, visual, and high-impact.'),
  bullets: z.array(z.string()).optional().describe('3-4 key short bullet items (needed if standard, split, or grid layouts are selected).'),
  quoteText: z.string().optional().describe('Quote body (required ONLY if layoutType is "quote").'),
  quoteAuthor: z.string().optional().describe('Quote attribution/author (required ONLY if layoutType is "quote").'),
  stats: z.array(z.object({
    value: z.string().describe('Large display number/metric (e.g. "99%", "$12M", "5x")'),
    label: z.string().describe('Short descriptive label for the metric')
  })).optional().describe('List of 2-3 key metrics (required ONLY if layoutType is "stats").'),
  gridItems: z.array(z.object({
    title: z.string().describe('Feature/pillar title'),
    description: z.string().describe('Feature description')
  })).optional().describe('List of 3 features/pillars (required ONLY if layoutType is "grid").'),
  speakerNotes: z.string().optional().describe('Speaker notes'),
  imagePrompt: z
    .string()
    .describe(
      'Highly detailed, contextual image generation prompt matching the topic, emotional tone, and layout style (16:9 cinematic, ultra detailed, style matching the requested presentation theme, no text, no logos)',
    ),
})

const slideResponseSchema = z.object({
  slides: z.array(slideSchema),
})

export const generatePresentation = inngest.createFunction(
  {
    id: 'generate-presentation',
    retries: 2,
    triggers: [{ event: 'presentation/generate' }],
  },
  async ({ event, step }) => {
    const { presentationId } = event.data as { presentationId: string }
    console.log('[Presentation Generation] Started', { presentationId })

    try {
      const presentation = await step.run('fetch-presentation', async () => {
        console.log('[Presentation Generation] Fetching presentation data')
        const p = await runDbQueryWithRetry(() => prisma.presentation.findUnique({
          where: { id: presentationId },
        }))
        if (!p) throw new Error('Presentation not found')
        console.log('[Presentation Generation] Presentation fetched', {
          title: p.title,
          slideCount: p.slideCount,
          style: p.style,
          tone: p.tone,
        })
        return p
      })

      await step.run('mark-generating', async () => {
        console.log('[Presentation Generation] Marking as GENERATING')
        await runDbQueryWithRetry(() => prisma.presentation.update({
          where: { id: presentation.id },
          data: {
            status: PresentationStatus.GENERATING,
          },
        }))
      })

      const { slides } = await step.run('generate-slides-content', async () => {
        console.log(
          '[Presentation Generation] Starting slide content generation',
        )
        validateRequiredAiEnv()

        const systemPrompt = `You are a world-class presentation designer and visual copywriter.
You will write a compelling, narrative-driven presentation on the given topic.

Your ONLY output is a valid JSON object — no markdown fences, no preamble, no explanation.

## Presentation context
- Topic: "${presentation.prompt}"
- Theme/Style: ${presentation.style}
- Tone: ${presentation.tone}
- Slide count: ${presentation.slideCount}

## Slide layout strategy
To make the presentation feel professional and cinematic like Gamma.app, vary layoutType dynamically across slides. Avoid repeating the same layout back-to-back.
Choose layouts based on slide purpose:
- Slide 1 (Intro): Must be "hero" layout.
- Slides 2-3 (Problem/Context): Use "split-left" or "split-right".
- Slide 4 (Key Insight/Quote): Use "quote" to break the pace.
- Slide 5 (Core Features/Pillars): Use "grid" (columns).
- Slide 6 (Performance/Data): Use "stats" (metrics).
- Slide 7 (Visual/Impact): Use "full-image" with overlaid text.
- Slide 8 (Conclusion/CTA): Use "hero" or "split" to wrap up.

## Layout specifications (Fill appropriate fields)
- If layoutType is "quote": Fill "quoteText" and "quoteAuthor".
- If layoutType is "stats": Fill "stats" array (2-3 items).
- If layoutType is "grid": Fill "gridItems" array (exactly 3 items).
- If layoutType is "split-left" or "split-right": Fill "body" or "bullets".
- If layoutType is "standard": Fill "body" or "bullets".

## imagePrompt requirements (critical)
Create a detailed prompt for generating an image that illustrates the slide's core metaphor.
- Do NOT generate generic or text-heavy prompts.
- Describe the setting, lighting, color tone, style matching "${presentation.style}", and cinematic details.
- Avoid text, letters, watermarks, screens, or phones in images.
- Example: "A sleek workspace overlooking a neon fujimi skyline, cinematic lighting, fuchsia and slate accents, futuristic illustration, ultra detailed, 16:9"

## Narrative structure
Ensure the presentation has a clear progression from introduction, core problem/opportunity, detailed solution/arguments, data/proof points, and a strong conclusion.`

        const result = await generateText({
          model: google('gemini-2.5-flash'),
          output: Output.object({ schema: slideResponseSchema }),
          system: systemPrompt,
          prompt: presentation.prompt,
        })

        console.log(
          '[Presentation Generation] Slide content generated successfully',
          {
            slideCount: result.output.slides.length,
          },
        )

        return result.output
      })

      await step.run('delete-old-slides', async () => {
        console.log('[Presentation Generation] Deleting old slides')
        await runDbQueryWithRetry(() => prisma.slide.deleteMany({
          where: { presentationId: presentation.id },
        }))
      })

      const imageKitAvailable = await step.run('check-imagekit', async () => {
        return checkImageKitAvailability()
      })

      console.log('[Presentation Generation] ImageKit availability:', imageKitAvailable)

      const uploadedImageUrls: string[] = []
      // Sequential loop to execute slide generation steps to protect connection pooling and HF rate limits
      for (let index = 0; index < slides.length; index++) {
        const slide = slides[index]
        const url = await step.run(`generate-image-slide-${index}`, async () => {
          if (!imageKitAvailable) {
            console.log('[Presentation Generation] Skipping image generation because ImageKit is unavailable. Using placeholder for slide:', index)
            return getPlaceholderImage(
              slide.heading,
              slide.body ?? slide.bullets?.join(' ') ?? '',
              slide.imagePrompt
            )
          }
          return createSlideImageAndUpload({
            presentationId,
            slideOrder: index,
            imagePrompt: slide.imagePrompt,
            slideTitle: slide.heading,
            slideContent: slide.body ?? slide.bullets?.join(' ') ?? '',
            style: presentation.style,
          })
        })
        uploadedImageUrls.push(url)
      }

      await step.run('save-slides-to-db', async () => {
        const data = slides.map((slide, index) => {
          // Strict validation and default fallbacks for slide content JSON fields
          const layoutType = slide.layoutType || 'standard'
          let body = slide.body || ''
          let bullets = slide.bullets || []
          let quoteText = slide.quoteText || ''
          let quoteAuthor = slide.quoteAuthor || ''
          let stats = slide.stats || []
          let gridItems = slide.gridItems || []

          // Auto-generate fallback content when missing based on layout type
          if (layoutType === 'quote' && !quoteText) {
            quoteText = body || 'A powerful strategic perspective.'
            quoteAuthor = quoteAuthor || 'Leader'
          }
          if (layoutType === 'stats' && stats.length === 0) {
            stats = [
              { value: '75%', label: 'Projected growth index' },
              { value: '2x', label: 'Operational speed improvement' }
            ]
          }
          if (layoutType === 'grid' && gridItems.length === 0) {
            gridItems = [
              { title: 'Core Advantage 1', description: 'Detailed presentation pillar highlight.' },
              { title: 'Core Advantage 2', description: 'Detailed presentation pillar highlight.' },
              { title: 'Core Advantage 3', description: 'Detailed presentation pillar highlight.' }
            ]
          }
          if (layoutType === 'standard' && !body && bullets.length === 0) {
            body = 'Key insights and summary metrics are shown on this page.'
          }

          const contentJson = JSON.stringify({
            layoutType,
            body,
            bullets,
            quoteText,
            quoteAuthor,
            stats,
            gridItems,
          })

          return {
            presentationId,
            order: index,
            title: slide.heading.trim() || `Slide ${index + 1}`,
            content: contentJson,
            notes: slide.speakerNotes?.trim() || null,
            imagePrompt: slide.imagePrompt || null,
            imageUrl: uploadedImageUrls[index] || null,
          }
        })

        await runDbQueryWithRetry(() => prisma.slide.createMany({ data }))
        console.log('[Presentation Generation] Slides created in database', {
          presentationId,
          slideCount: data.length,
        })
      })

      await step.run('mark-completed', async () => {
        console.log('[Presentation Generation] Marking as COMPLETED')
        await runDbQueryWithRetry(() => prisma.presentation.update({
          where: { id: presentation.id },
          data: {
            status: PresentationStatus.COMPLETED,
          },
        }))
      })

      console.log('[Presentation Generation] Successfully completed', {
        presentationId,
        slideCount: slides.length,
      })
      return { success: true, slideCount: slides.length }
    } catch (error) {
      console.error('[Presentation Generation] Failed with error', {
        presentationId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      try {
        await runDbQueryWithRetry(() => prisma.presentation.update({
          where: { id: presentationId },
          data: { status: PresentationStatus.FAILED },
        }))
        console.log('[Presentation Generation] Marked as FAILED')
      } catch (updateError) {
        console.error('[Presentation Generation] Failed to mark as FAILED', {
          presentationId,
          error:
            updateError instanceof Error
              ? updateError.message
              : String(updateError),
        })
      }
      throw error
    }
  }
)


