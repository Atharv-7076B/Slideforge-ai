import { createServerFn } from '@tanstack/react-start'
import { presentationIdInputSchema } from '../types/schemas'
import { authMiddleware } from '#/middleware/auth'
import { prisma } from '#/lib/db'

// Helper function to serialize Presentation with DateTime fields
function serializePresentation(presentation: any) {
  if (!presentation) return null
  return {
    ...presentation,
    createdAt:
      presentation.createdAt?.toISOString?.() ?? presentation.createdAt,
    updatedAt:
      presentation.updatedAt?.toISOString?.() ?? presentation.updatedAt,
    slides: presentation.slides?.map((slide: any) => ({
      ...slide,
      createdAt: slide.createdAt?.toISOString?.() ?? slide.createdAt,
      updatedAt: slide.updatedAt?.toISOString?.() ?? slide.updatedAt,
    })),
  }
}

export const getPresentationWithSLiedes = createServerFn({ method: 'GET' })
  .inputValidator((data) => presentationIdInputSchema.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    try {
      console.log('[getPresentationWithSLiedes] Called with id:', data.id)
      const userId = context?.session?.user?.id
      const row = await prisma.presentation.findFirst({
        where: {
          id: data.id,
          userId,
        },
        include: {
          slides: {
            orderBy: { order: 'asc' },
          },
        },
      })
      console.log('[getPresentationWithSLiedes] Found presentation:', {
        id: row?.id,
        slideCount: row?.slides?.length,
      })
      const result = serializePresentation(row)
      console.log('[getPresentationWithSLiedes] Returning serialized result')
      return result
    } catch (error) {
      console.error('[getPresentationWithSLiedes] FAILED:', error)
      throw error
    }
  })

export const listPresentations = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      console.log('[listPresentations] Called')
      const userId = context?.session?.user?.id
      console.log('[listPresentations] userId:', userId)
      const presentations = await prisma.presentation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      })
      console.log(
        '[listPresentations] Found presentations:',
        presentations.length,
      )
      const result = presentations.map(serializePresentation)
      console.log('[listPresentations] Returning serialized results')
      return result
    } catch (error) {
      console.error('[listPresentations] FAILED:', error)
      throw error
    }
  })
