import { createAuthClient } from 'better-auth/react'

function resolveAuthClientOptions() {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : import.meta.env.VITE_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL

  if (origin) {
    return { baseURL: origin, basePath: '/api/auth' as const }
  }

  /** Server render and same-tab browser: Better Auth resolves `/api/auth` on the current host. */
  return { basePath: '/api/auth' as const }
}

export const authClient = createAuthClient(resolveAuthClientOptions())
