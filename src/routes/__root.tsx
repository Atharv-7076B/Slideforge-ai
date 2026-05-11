import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import { QueryClientProvider } from '@tanstack/react-query'

import appCss from '../styles.css?url'

import { Toaster } from '#/components/ui/sonner'
import Navbar from '#/components/navbar'
import { queryClient } from '#/lib/query-client'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],

    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootLayout,
  shellComponent: RootDocument,

  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
})

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-svh bg-background text-foreground">
        <Navbar />

        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script />
        <HeadContent />
      </head>

      <body className="font-sans antialiased selection:bg-primary/20">
        {children}

        <Toaster />

        <Scripts />
      </body>
    </html>
  )
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Something went wrong
        </h1>

        <p className="text-muted-foreground break-words">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    </div>
  )
}

function RootNotFoundComponent() {
  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">404</h1>

        <p className="text-muted-foreground">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  )
}
