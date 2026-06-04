import { createServerFn } from '@tanstack/react-start'

import {
  createPresentationInputSchema,
  presentationIdInputSchema,
  updatePresentationInputSchema,
} from '../types/schemas'

import { authFnMiddleware } from '#/middleware/auth'

import { prisma } from '#/lib/db'

import { generateSlug } from 'random-word-slugs'

import { PresentationStatus } from '@prisma/client'

import { inngest } from '#/integrations/inngest/client'
import { generatePresentationInline } from '#/integrations/inngest/functions'

// Helper function to serialize Presentation with DateTime fields
function serializePresentation(presentation: any) {
  if (!presentation) return null
  return {
    ...presentation,
    createdAt:
      presentation.createdAt?.toISOString?.() ?? presentation.createdAt,
    updatedAt:
      presentation.updatedAt?.toISOString?.() ?? presentation.updatedAt,
  }
}

export const createPresentation = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => createPresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    try {
      console.log(
        '[createPresentation] Called with prompt length:',
        data.prompt.length,
      )
      const userId = context?.session?.user?.id

      if (!userId) {
        throw new Error('Unauthorized')
      }
      const presentation = await prisma.presentation.create({
        data: {
          userId,
          title: generateSlug(),
          prompt: data.prompt,
          slideCount: data.slideCount,
          style: data.style,
          tone: data.tone,
          layout: data.layout,
          status: PresentationStatus.GENERATING,
        },
      })
      console.log('[createPresentation] Created presentation:', presentation.id)
      let finalPresentation = presentation
      try {
        await inngest.send({
          name: 'presentation/generate',
          data: {
            presentationId: presentation.id,
          },
        })
        console.log('[createPresentation] Sent to Inngest')
      } catch (error: any) {
        console.warn('[createPresentation] Failed to publish event to Inngest. Falling back to inline generation.', {
          presentationId: presentation.id,
          error: error?.message || String(error),
        })
        try {
          await generatePresentationInline(presentation.id)
          const updated = await prisma.presentation.findUnique({
            where: { id: presentation.id },
          })
          if (updated) {
            finalPresentation = updated
          }
          console.log('[createPresentation] Inline generation fallback completed successfully')
        } catch (fallbackError) {
          console.error('[createPresentation] Inline generation fallback failed:', fallbackError)
          throw fallbackError
        }
      }
      const result = serializePresentation(finalPresentation)
      console.log('[createPresentation] Returning serialized result')
      return result
    } catch (error) {
      console.error('[createPresentation] FAILED:', error)
      throw error
    }
  })

export const updatePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    try {
      console.log('[updatePresentation] Called with id:', data.id)
      const userId = context?.session.user?.id
      const { id, ...patch } = data
      const existing = await prisma.presentation.findFirst({
        where: { id, userId },
      })
      if (!existing) throw new Error('Presentation not found')
      const updateData = patch

      const updated = await prisma.presentation.update({
        where: { id, userId },
        data: updateData,
      })
      console.log('[updatePresentation] Updated presentation:', id)
      const result = serializePresentation(updated)
      console.log('[updatePresentation] Returning serialized result')
      return result
    } catch (error) {
      console.error('[updatePresentation] FAILED:', error)
      throw error
    }
  })

export const deletePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    try {
      console.log('[deletePresentation] Called with id:', data.id)
      const userId = context?.session.user?.id
      const existing = await prisma.presentation.findFirst({
        where: { id: data.id, userId },
      })
      if (!existing) throw new Error('Not found')
      await prisma.presentation.delete({
        where: { id: data.id },
      })
      console.log('[deletePresentation] Deleted presentation:', data.id)
      return {
        ok: true as const,
      }
    } catch (error) {
      console.error('[deletePresentation] FAILED:', error)
      throw error
    }
  })

export const regeneratePresentation = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    try {
      console.log('[regeneratePresentation] Called with id:', data.id)
      const userId = context?.session?.user?.id

      const existing = await prisma.presentation.findFirst({
        where: {
          id: data.id,
          userId,
        },
      })

      if (!existing) {
        throw new Error('Presentation not found')
      }

      await prisma.presentation.update({
        where: {
          id: data.id,
        },
        data: {
          status: PresentationStatus.GENERATING,
        },
      })
      console.log('[regeneratePresentation] Updated status to GENERATING')
      try {
        await inngest.send({
          name: 'presentation/generate',
          data: {
            presentationId: data.id,
          },
        })
        console.log('[regeneratePresentation] Sent to Inngest')
      } catch (error: any) {
        console.warn('[regeneratePresentation] Failed to publish event to Inngest. Falling back to inline generation.', {
          presentationId: data.id,
          error: error?.message || String(error),
        })
        try {
          await generatePresentationInline(data.id)
          console.log('[regeneratePresentation] Inline generation fallback completed successfully')
        } catch (fallbackError) {
          console.error('[regeneratePresentation] Inline generation fallback failed:', fallbackError)
          throw fallbackError
        }
      }

      return {
        ok: true as const,
      }
    } catch (error) {
      console.error('[regeneratePresentation] FAILED:', error)
      throw error
    }
  })
