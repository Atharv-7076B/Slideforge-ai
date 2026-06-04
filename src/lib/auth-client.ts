import { createAuthClient } from 'better-auth/react'

function resolveAuthClientOptions() {
  if (typeof window !== 'undefined') {
    return {
      baseURL: window.location.origin,
      basePath: '/api/auth' as const,
    }
  }

  // Server render: Do not set baseURL to prevent client-side SDK from making outbound network requests during SSR.
  return {
    basePath: '/api/auth' as const,
  }
}

export const authClient = createAuthClient(resolveAuthClientOptions())
