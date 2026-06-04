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
    return serializePresentation(row)
  })

export const listPresentations = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context?.session?.user?.id
    const presentations = await prisma.presentation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    return presentations.map(serializePresentation)
  })
