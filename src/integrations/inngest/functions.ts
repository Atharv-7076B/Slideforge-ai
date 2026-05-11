import { prisma } from '#/lib/db'
import { inngest } from './client'
import { z } from 'zod'
import { Output, generateText } from 'ai'
import { google } from '@ai-sdk/google'

function buildImageKitUrl(prompt: string, filename: string): string {
  const baseUrl = process.env.IMAGEKIT_BASE_URL!
  const sanitizedPrompt = prompt
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)

  return `${baseUrl}/ik-genimg-prompt-${encodeURIComponent(sanitizedPrompt)}/${filename}.jpg?tr=w-1280,h-720`
}


const slideSchema = z.object({
  title: z.string().describe('Slide title'),
  content: z.string().describe('Main content / bullet points for the slide'),
  notes: z.string().optional().describe('Speaker notes'),
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
    const presentation = await step.run('fetch-presentation', async () => {
      const p = await prisma.presentation.findUnique({
        where: { id: presentationId },
      })
      if (!p) throw new Error('Presentation not found')
      return p
    })

    await step.run('mark-generating', async () => {
      await prisma.presentation.update({
        where: { id: presentation.id },
        data: {
          status: 'GENERATING',
        },
      })
    })

    const { slides } = await step.run('generate-slides-content', async () => {
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
  "title": "string — overall presentation title",
  "accentColor": "string — one hex color that defines the visual identity, e.g. '#2563EB'",
  "fontPairing": "string — e.g. 'Playfair Display / Inter'",
  "slides": [
    {
      "id": number,
      "type": "title | content | two-column | quote | data | closing",
      "heading": "string — max 8 words",
      "subheading": "string | null — max 12 words, used on title/closing slides",
      "bullets": ["string"] | null,   // max 4 bullets, max 12 words each
      "body": "string | null",         // paragraph text for quote/content types, max 40 words
      "leftColumn": "string | null",   // for two-column type
      "rightColumn": "string | null",  // for two-column type
      "stat": { "value": "string", "label": "string" } | null,  // for data slides
      "imagePrompt": "string",         // see rules below
      "speakerNotes": "string",        // 1-3 sentences the presenter would say
      "layout": "image-left | image-right | image-background | image-top | no-image"
    }
  ]
}

## Slide structure rules
- Slide 1: MUST be type "title" with a compelling heading and subheading
- Slide ${presentation.slideCount}: MUST be type "closing" with a clear CTA or summary
- Vary slide types — do not repeat the same type more than twice consecutively
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
      return result.output
    })

    await step.run('delete-old-slides', async () => {
      await prisma.slide.deleteMany({
        where: { presentationId: presentation.id },
      })
    })

    await step.run('create-slides', async () => {
      const data = slides.map((slide, index) => ({
        presentationId,
        order: index,
        title: slide.title,
        content: slide.content,
        notes: slide.notes ?? null,
        imagePrompt: slide.imagePrompt,
        imageUrl: buildImageKitUrl(
          slide.imagePrompt,
          `slide-${presentationId}-${index}`,
        ),
      }))
      await prisma.slide.createMany({ data })
    })

    await step.run('mark-completed', async () => {
      await prisma.presentation.update({
        where: { id: presentation.id },
        data: {
          status: 'COMPLETED',
        },
      })
    })

    return { success: true, slideCount: slides.length }
  },
)
