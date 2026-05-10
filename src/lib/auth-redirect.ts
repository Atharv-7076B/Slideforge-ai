export function toInternalPath(redirectTo?: string) {
  if (!redirectTo) return undefined

  try {
    // Accept absolute URLs only if they resolve to the current origin.
    if (redirectTo.startsWith('/')) {
      return redirectTo
    }

    const url = new URL(
      redirectTo,
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost',
    )
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
