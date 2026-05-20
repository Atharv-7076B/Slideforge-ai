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

function getBasicAuthHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`
}

async function checkImageKitAvailability(): Promise<boolean> {
  try {
    validateImageKitConfigOrThrow()
    const { privateKey } = getImageKitConfig()

    // Probe upload API auth; avoids probing generated delivery URLs.
    const response = await fetch(
      'https://upload.imagekit.io/api/v1/files/upload',
      {
        method: 'POST',
        headers: {
          Authorization: getBasicAuthHeader(privateKey),
        },
      },
    )
    if (!response.ok) {
      // 400 is expected due to missing form body; means auth + endpoint are reachable.
      if (response.status === 400) return true
      console.error(
        'ImageKit availability probe returned unexpected response',
        {
          status: response.status,
          statusText: response.statusText,
        },
      )
      return false
    }
    return true
  } catch (error) {
    console.error('ImageKit availability probe failed', { error })
    return false
  }
}

async function generateImageFromPrompt(prompt: string): Promise<string | null> {
  const hfToken = process.env.HF_TOKEN
  if (!hfToken) {
    console.error('Missing HF_TOKEN; skipping image generation')
    return null
  }

  try {
    console.log(
      '[HF Image Generation] Starting for prompt:',
      prompt.slice(0, 100),
    )

    // Optimized prompt for FLUX.1 Schnell
    const optimizedPrompt = `Professional presentation slide illustration. ${prompt}. High quality, clean design, suitable for corporate/business presentations. 16:9 aspect ratio.`

    const response = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: optimizedPrompt,
          parameters: {
            width: 1440,
            height: 810,
            num_inference_steps: 4,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      const errorMsg = `Hugging Face image generation failed (${response.status}): ${errorBody.slice(0, 300)}`
      console.error('[HF Image Generation] Error:', errorMsg)
      throw new Error(errorMsg)
    }

    // Hugging Face returns binary image data
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength === 0) {
      console.error('[HF Image Generation] Received empty buffer')
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
    console.error('[HF Image Generation] Exception:', error)
    throw error
  }
}

async function uploadBase64ToImageKit(params: {
  base64Image: string
  fileName: string
  folderPath: string
}): Promise<string> {
  validateImageKitConfigOrThrow()
  const { privateKey } = getImageKitConfig()

  const formData = new FormData()
  formData.append('file', `data:image/png;base64,${params.base64Image}`)
  formData.append('fileName', `${params.fileName}.png`)
  formData.append('folder', params.folderPath)
  formData.append('useUniqueFileName', 'false')

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
    throw new Error(
      `ImageKit upload failed (${response.status}): ${body.slice(0, 300)}`,
    )
  }

  const payload = (await response.json()) as { url?: string }
  const url = payload.url?.trim()
  if (!url) {
    throw new Error('ImageKit upload succeeded but no URL returned')
  }

  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('ImageKit returned non-http(s) URL')
  }

  return parsed.toString()
}

async function createSlideImageAndUpload(params: {
  presentationId: string
  slideOrder: number
  imagePrompt: string
}): Promise<string | null> {
  try {
    console.log('[Image Pipeline] Starting generation and upload', {
      presentationId: params.presentationId,
      slideOrder: params.slideOrder,
      promptPreview: params.imagePrompt.slice(0, 80),
    })

    const base64Image = await generateImageFromPrompt(params.imagePrompt)
    if (!base64Image) {
      console.warn('[Image Pipeline] No image data received from HF', {
        presentationId: params.presentationId,
        slideOrder: params.slideOrder,
      })
      return null
    }

    const fileName = sanitizeFileName(
      `slide-${params.presentationId}-${params.slideOrder}`,
    )

    console.log('[Image Pipeline] Image generated, uploading to ImageKit', {
      fileName,
      sizeBytes: base64Image.length,
    })

    const imageUrl = await uploadBase64ToImageKit({
      base64Image,
      fileName,
      folderPath: `/presentations/${sanitizeFileName(params.presentationId)}`,
    })

    console.log('[Image Pipeline] Successfully uploaded image', {
      presentationId: params.presentationId,
      slideOrder: params.slideOrder,
      imageUrl: imageUrl.slice(0, 100) + '...',
    })

    return imageUrl
  } catch (error) {
    console.error('[Image Pipeline] Slide image generation/upload failed', {
      presentationId: params.presentationId,
      slideOrder: params.slideOrder,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

const slideSchema = z.object({
  heading: z.string().describe('Slide heading'),
  body: z.string().optional().describe('Main slide paragraph content'),
  bullets: z.array(z.string()).optional().describe('Bullet points'),
  speakerNotes: z.string().optional().describe('Speaker notes'),
  imagePrompt: z
    .string()
    .describe(
      'A concise prompt to generate an illustration for this slide (professional, clean style, no text in image)',
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
        const p = await prisma.presentation.findUnique({
          where: { id: presentationId },
        })
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
        await prisma.presentation.update({
          where: { id: presentation.id },
          data: {
            status: PresentationStatus.GENERATING,
          },
        })
      })

      const { slides } = await step.run('generate-slides-content', async () => {
        console.log(
          '[Presentation Generation] Starting slide content generation',
        )
        validateRequiredAiEnv()

        const systemPrompt = `You are an expert presentation designer and content strategist.

Your ONLY output is a valid JSON object — no markdown fences, no preamble, no explanation. Any non-JSON output will break the application.

## Presentation context
- Style: ${presentation.style}
- Tone: ${presentation.tone}
- Layout preference: ${presentation.layout}
- Slide count: ${presentation.slideCount}

## Output schema
Return exactly this structure:

{
  "slides": [
    {
      "heading": "string — max 8 words",
      "body": "string | null",
      "bullets": ["string"] | null,
      "speakerNotes": "string | null",
      "imagePrompt": "string"
    }
  ]
}

## Slide structure rules
- Generate exactly ${presentation.slideCount} slides
- Slide 1 should act like a title slide
- Final slide should provide a clear closing CTA or summary
- Apply tone "${presentation.tone}" to word choices in every heading and bullet
- Apply style "${presentation.style}" to how ideas are framed (e.g. bold/provocative vs. measured/academic)

## imagePrompt rules (critical)
Each imagePrompt must:
- Be 20-40 words describing a photorealistic or illustrated scene
- NEVER include text, words, logos, or UI elements in the image
- NEVER depict faces of identifiable people
- Describe the lighting, color palette, and mood explicitly
- Directly relate to the slide's specific content
- Example: "Overhead view of a modern open-plan office with warm amber lighting, wooden desks, green plants, and soft morning light streaming through floor-to-ceiling windows"

## Quality rules
- Headings: action-oriented or curiosity-driving, not generic labels
- Bullets: start with strong verbs or concrete numbers
- No filler phrases ("In conclusion…", "As we can see…")
- Every slide must earn its place — cut if it doesn't add new value
- Ensure narrative arc: problem → insight → solution → evidence → action`

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
        await prisma.slide.deleteMany({
          where: { presentationId: presentation.id },
        })
      })

      await step.run('create-slides', async () => {
        const imageKitAvailable = await checkImageKitAvailability()
        if (!imageKitAvailable) {
          console.error(
            '[Presentation Generation] ImageKit is unavailable; slides will be stored without image URLs for this run',
            { presentationId },
          )
        } else {
          console.log(
            '[Presentation Generation] ImageKit is available, will generate images',
            {
              presentationId,
              slideCount: slides.length,
            },
          )
        }

        const data = slides.map((slide, index) => {
          const bulletsText =
            slide.bullets && slide.bullets.length > 0
              ? slide.bullets.map((bullet) => `• ${bullet}`).join('\n')
              : ''
          const bodyText = slide.body?.trim() ?? ''
          const content = [bodyText, bulletsText].filter(Boolean).join('\n\n')
          return {
            presentationId,
            order: index,
            title: slide.heading.trim() || `Slide ${index + 1}`,
            content: content || 'No content generated',
            notes: slide.speakerNotes?.trim() || null,
            imagePrompt: slide.imagePrompt || null,
            imageUrl: null as string | null,
          }
        })

        console.log(
          '[Presentation Generation] Starting parallel image generation',
          {
            presentationId,
            totalSlides: slides.length,
          },
        )

        const uploadedImageUrls = await Promise.all(
          slides.map((slide, index) => {
            if (!imageKitAvailable) {
              console.log(
                '[Presentation Generation] Skipping image for slide',
                {
                  slideOrder: index,
                  reason: 'ImageKit unavailable',
                },
              )
              return Promise.resolve<string | null>(null)
            }
            console.log(
              '[Presentation Generation] Queuing image generation for slide',
              {
                slideOrder: index,
                promptLength: slide.imagePrompt.length,
              },
            )
            return createSlideImageAndUpload({
              presentationId,
              slideOrder: index,
              imagePrompt: slide.imagePrompt,
            })
          }),
        )

        const successCount = uploadedImageUrls.filter(
          (url) => url !== null,
        ).length
        console.log(
          '[Presentation Generation] Image generation batch completed',
          {
            presentationId,
            successCount,
            totalSlides: slides.length,
            failureCount: slides.length - successCount,
          },
        )

        const finalData = data.map((slide, index) => ({
          ...slide,
          imageUrl: uploadedImageUrls[index],
        }))

        await prisma.slide.createMany({ data: finalData })
        console.log('[Presentation Generation] Slides created in database', {
          presentationId,
          slideCount: finalData.length,
        })
      })

      await step.run('mark-completed', async () => {
        console.log('[Presentation Generation] Marking as COMPLETED')
        await prisma.presentation.update({
          where: { id: presentation.id },
          data: {
            status: PresentationStatus.COMPLETED,
          },
        })
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
        await prisma.presentation.update({
          where: { id: presentationId },
          data: { status: PresentationStatus.FAILED },
        })
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
  },
)
