import { createFileRoute, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { authClient } from '#/lib/auth-client'
import ThemeToggle from '#/components/ThemeToggle'
import { getSession } from '#/lib/auth.functions'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    return { user: session.user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 pl-35">
      <div className="mx-auto max-w-5xl">
        <h1>hello world</h1>
      </div>
    </main>
  )
}
