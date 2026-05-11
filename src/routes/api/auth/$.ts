import { auth } from '#/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

/**
 * Better Auth's `getBaseURL(..., request)` uses `new URL(request.url)`. Some server
 * runtimes pass a path-only `request.url` (e.g. `/api/auth/...`), which makes origin
 * resolution throw and surfaces as 500 on `/api/auth/get-session`.
 */
function toAbsoluteRequest(request: Request): Request {
  const raw = request.url
  try {
    const parsed = new URL(raw)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return request
    }
  } catch {
    /* treat as non-absolute */
  }

  const host = request.headers.get('host')
  if (!host) {
    return request
  }

  const forwarded = request.headers.get('x-forwarded-proto')
  const protocol =
    forwarded === 'https' || forwarded === 'http' ? forwarded : 'http'

  const path = raw.startsWith('/') ? raw : `/${raw}`
  return new Request(`${protocol}://${host}${path}`, request)
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return await auth.handler(toAbsoluteRequest(request))
      },
      POST: async ({ request }: { request: Request }) => {
        return await auth.handler(toAbsoluteRequest(request))
      },
    },
  },
})
