import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.functions'
import { Button } from '#/components/ui/button'
import { Settings, User, CreditCard, Key, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/settings')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
    return {
      user: session.user,
    }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { user } = Route.useRouteContext()

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/dashboard" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Settings className="size-8 text-primary" />
            SaaS Console Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences, billing subscriptions, and API keys.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Tabs */}
          <div className="glass rounded-2xl p-4 h-fit space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-left">
              <User className="size-4" />
              Profile Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted/10 text-muted-foreground hover:text-foreground text-left transition-colors">
              <CreditCard className="size-4" />
              Billing & SaaS Plan
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted/10 text-muted-foreground hover:text-foreground text-left transition-colors">
              <Key className="size-4" />
              Developer API Keys
            </button>
          </div>

          {/* Settings Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="glass rounded-3xl p-6 space-y-6">
              <h2 className="text-lg font-bold border-b border-border/40 pb-3 flex items-center gap-2">
                <User className="size-5 text-primary" />
                Profile Information
              </h2>

              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-base">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-sm text-muted-foreground leading-relaxed">
                Premium multi-user collaboration and custom branding features are currently active on your plan.
              </div>
            </div>

            {/* Premium Block */}
            <div className="glass rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-bold border-b border-border/40 pb-3 flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                Billing Details
              </h2>
              <div className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border/40">
                <div>
                  <p className="text-sm font-semibold text-foreground">SlideForge Pro Plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Renews automatically via Stripe</p>
                </div>
                <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/15 rounded-full border border-primary/20">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
