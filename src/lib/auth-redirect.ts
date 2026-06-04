export function toInternalPath(redirectTo?: string) {
  if (!redirectTo) return undefined

  try {
    // Accept absolute URLs only if they resolve to the current origin.
    if (redirectTo.startsWith('/')) {
      return redirectTo
    }

    const baseOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.BETTER_AUTH_URL || 'https://slideforge-ai-phi.vercel.app'

    const url = new URL(redirectTo, baseOrigin)
    if (
      typeof window === 'undefined' ||
      url.origin === window.location.origin
    ) {
      return url.pathname + url.search + url.hash
    }
  } catch {
    return undefined
  }

  return undefined
}
