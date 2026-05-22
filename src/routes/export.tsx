import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.functions'
import { Button } from '#/components/ui/button'
import { Download, ArrowLeft, Presentation, FileText, Code } from 'lucide-react'

export const Route = createFileRoute('/export')({
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
  component: ExportPage,
})

function ExportPage() {
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
            <Download className="size-8 text-primary" />
            Presentation Export Console
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose a target format to export your SlideForge AI decks for external use.
          </p>
        </div>

        {/* Formats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PPTX */}
          <div className="glass rounded-3xl p-6 flex flex-col justify-between border border-primary/20 bg-primary/5 hover:scale-[1.02] transition-transform">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary flex items-center justify-center">
                <Presentation className="size-6 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold">Microsoft PowerPoint (.pptx)</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full layout fidelity. Exports widescreen 16:9 slides preserving colors, grids, bullet structures, and AI-generated image elements.
              </p>
            </div>
            <div className="pt-6">
              <Button asChild className="w-full rounded-xl gap-2">
                <Link to="/dashboard">
                  <Download className="size-4" />
                  Select deck in Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* PDF */}
          <div className="glass rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                <FileText className="size-6 text-foreground" />
              </div>
              <h2 className="text-lg font-bold">Portable Document (PDF)</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vector graphic export suitable for direct print distribution or crisp document reading. Fonts and layout sizes are pre-balanced.
              </p>
            </div>
            <div className="pt-6">
              <Button disabled variant="outline" className="w-full rounded-xl">
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Markdown */}
          <div className="glass rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                <Code className="size-6 text-foreground" />
              </div>
              <h2 className="text-lg font-bold">Structured Outline (.md)</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Downloads raw text and layout configurations as structured Markdown, perfect for documentation and importing into outline engines.
              </p>
            </div>
            <div className="pt-6">
              <Button disabled variant="outline" className="w-full rounded-xl">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
