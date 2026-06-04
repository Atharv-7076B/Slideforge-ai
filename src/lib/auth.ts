import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prisma } from './db'

const githubClientId = process.env.GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

/**
 * Better Auth resolves `baseURL` at init from `BETTER_AUTH_URL`. If that env var is
 * missing in the server bundle, `baseURL` becomes empty and the handler falls back
 * to `getBaseURL(..., request)`, which requires `request.url` to be absolute. A
 * path-only URL makes `getOrigin` fail and throws before `/get-session` runs (500).
 */
const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL
const envUrl = process.env.BETTER_AUTH_URL || process.env.VITE_PUBLIC_APP_URL

const resolvedBaseURL = (() => {
  if (envUrl && !(isProd && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')))) {
    return envUrl
  }
  if (isProd) {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    return 'https://slideforge-ai-phi.vercel.app'
  }
  return 'http://localhost:3000'
})()

const devTrustedOrigins =
  process.env.NODE_ENV !== 'production'
    ? (['http://localhost:*', 'http://127.0.0.1:*'] as const)
    : []

const prodTrustedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://slideforge-ai-phi.vercel.app']
    : []

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: resolvedBaseURL,
  trustedOrigins: [...devTrustedOrigins, ...prodTrustedOrigins],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    ...(githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          },
        }
      : {}),
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})
