import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { Toaster } from '#/components/ui/sonner'
import Navbar from '#/components/navbar'

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
})
function RootLayout() {
  return (
    <div className="min-h-svh">
      <Navbar />
      <Outlet />
    </div>
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
