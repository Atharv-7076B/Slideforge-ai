import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({
  /** Use a root-relative auth endpoint so the same-domain flow works in dev and production. */
  baseURL: 'http://localhost:3000/api/auth',
})
