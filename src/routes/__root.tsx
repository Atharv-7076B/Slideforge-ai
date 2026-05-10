import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
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
      <div className="min-h-svh">
        <Navbar />
        <Outlet />
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
      <body className="font-sans antialiased bg-background text-foreground selection-bg-primary/20">
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}

function RootErrorComponent() {
  const routerState = useRouterState()
  const error = routerState.location.state?.error

  return (
    <div className="min-h-svh flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    </div>
  )
}

function RootNotFoundComponent() {
  return (
    <div className="min-h-svh flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    </div>
  )
}
