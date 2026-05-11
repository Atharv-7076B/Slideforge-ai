import { inngest } from '#/integrations/inngest/client'
import { generatePresentation } from '#/integrations/inngest/functions'

import { createFileRoute } from '@tanstack/react-router'

import { serve } from 'inngest/edge'

const handler = serve({
  client: inngest,
  functions: [generatePresentation],
})

export const Route = createFileRoute('/api/inngest')({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
      PUT: ({ request }) => handler(request),
    },
  },
})
