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
    try {
      await inngest.send({
        name: 'presentation/generate',
        data: {
          presentationId: presentation.id,
        },
      })
      return serializePresentation(presentation)
    } catch (error) {
      console.error('Failed to publish presentation/generate event', {
        presentationId: presentation.id,
        error,
      })
      await prisma.presentation.update({
        where: { id: presentation.id },
        data: { status: PresentationStatus.FAILED },
      })
      throw error
    }
  })

export const updatePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
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
    return serializePresentation(updated)
  })

export const deletePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context?.session.user?.id
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')
    await prisma.presentation.delete({
      where: { id: data.id },
    })
    return {
      ok: true as const,
    }
  })

export const regeneratePresentation = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
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
    try {
      await inngest.send({
        name: 'presentation/generate',
        data: {
          presentationId: data.id,
        },
      })
    } catch (error) {
      console.error('Failed to publish presentation/generate event', {
        presentationId: data.id,
        error,
      })
      await prisma.presentation.update({
        where: { id: data.id },
        data: { status: PresentationStatus.FAILED },
      })
      throw error
    }

    return {
      ok: true as const,
    }
  })
