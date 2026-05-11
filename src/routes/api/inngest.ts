import { inngest } from '#/integrations/inngest/client'
import { functions } from '#/integrations/inngest/functions/index'

import { createFileRoute } from '@tanstack/react-router'

import { serve } from 'inngest/edge'

if (process.env.NODE_ENV !== 'production') {
  console.info('[inngest] route initialized at /api/inngest', {
    functionCount: functions.length,
  })
}

const handler = serve({
  client: inngest,
  functions,
})

const mountedMethodLog = new Set<string>()

function logMountOnce(method: 'GET' | 'POST' | 'PUT') {
  if (process.env.NODE_ENV === 'production' || mountedMethodLog.has(method)) {
    return
  }
  mountedMethodLog.add(method)
  console.info(`[inngest] handler mounted for ${method}`)
}

export const Route = createFileRoute('/api/inngest')({
  server: {
    handlers: {
      GET: ({ request }) => {
        logMountOnce('GET')
        return handler(request)
      },
      POST: ({ request }) => {
        logMountOnce('POST')
        return handler(request)
      },
      PUT: ({ request }) => {
        logMountOnce('PUT')
        return handler(request)
      },
    },
  },
})
