import { createAuthClient } from 'better-auth/react'

function resolveAuthClientOptions() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL
  let origin = typeof window !== 'undefined' ? window.location.origin : undefined

  if (!origin) {
    const envUrl = import.meta.env.VITE_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL
    if (envUrl && !(isProd && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')))) {
      origin = envUrl
    } else if (isProd) {
      origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://slideforge-ai-phi.vercel.app'
    }
  }

  if (origin) {
    return { baseURL: origin, basePath: '/api/auth' as const }
  }

  /** Server render and same-tab browser: Better Auth resolves `/api/auth` on the current host. */
  return { basePath: '/api/auth' as const }
}

export const authClient = createAuthClient(resolveAuthClientOptions())
