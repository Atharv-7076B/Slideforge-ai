import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'

// Serialize session object with DateTime fields
function serializeSession(session: any) {
  if (!session) return null
  return {
    user: session.user
      ? {
          ...session.user,
          createdAt:
            session.user.createdAt?.toISOString?.() ?? session.user.createdAt,
          emailVerified:
            session.user.emailVerified?.toISOString?.() ??
            session.user.emailVerified,
        }
      : null,
    session: session.session
      ? {
          ...session.session,
          createdAt:
            session.session.createdAt?.toISOString?.() ??
            session.session.createdAt,
          expiresAt:
            session.session.expiresAt?.toISOString?.() ??
            session.session.expiresAt,
        }
      : null,
  }
}

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const headers = getRequestHeaders()
      console.log('[getSession] Called, fetching session from Better Auth')
      const session = await auth.api.getSession({ headers })
      console.log('[getSession] Success, session:', {
        userId: session?.user?.id,
        email: session?.user?.email,
      })
      const serialized = serializeSession(session)
      console.log('[getSession] Returning serialized session')
      return serialized
    } catch (error) {
      console.error('[getSession] FAILED:', error)
      throw error
    }
  },
)

export const ensureSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const headers = getRequestHeaders()
      console.log('[ensureSession] Called')
      const session = await auth.api.getSession({ headers })
      console.log('[ensureSession] Got session:', { userId: session?.user?.id })
      if (!session) throw new Error('Unauthorized')
      const serialized = serializeSession(session)
      console.log('[ensureSession] Returning serialized session')
      return serialized
    } catch (error) {
      console.error('[ensureSession] FAILED:', error)
      throw error
    }
  },
)
