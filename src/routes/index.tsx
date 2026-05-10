import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { getSession } from '#/lib/auth.functions'

import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { Button } from '#/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
} from '#/features/constant/presentation-options'

import { Wand2 } from 'lucide-react'
import { PRESENTATION_TEMPLATES } from '#/features/constant/presentation-templates'

type HomeFormState = {
  content: string
  slideCount: number
  style: (typeof SLIDE_STYLES)[number]['value']
  tone: (typeof TONE_OPTIONS)[number]['value']
  layout: (typeof LAYOUT_OPTIONS)[number]['value']
}

export const Route = createFileRoute('/')({
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

  component: RouteComponent,
})

function RouteComponent() {
  const [form, setForm] = useState<HomeFormState>({
    content: '',
    slideCount: 8,
    style: 'minimal',
    tone: 'formal',
    layout: 'balanced',
  })

  return (
    <main className="min-h-screen px-4 pt-24 pb-16">
      {/* Navbar width larger */}
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-10 space-y-3 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight md:text-5xl">
            What do you want to{' '}
            <span className="text-gradient-peach">create?</span>
          </h1>

          <p className="text-base text-muted-foreground md:text-lg">
            Enter your content and we'll generate a beautiful presentation
          </p>
        </div>

        {/* Smaller Content Box */}
        <div className="mx-auto w-full max-w-[860px] rounded-3xl border border-border/40 bg-card/60 p-5 shadow-2xl backdrop-blur-xl">
          {/* Textarea */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your presentation topic, paste your notes, or outline your key points..."
              value={form.content}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  content: e.target.value,
                }))
              }
              className="h-[190px] w-full resize-none overflow-y-auto rounded-2xl border-0 bg-background/30 p-4 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground/60">
              <span>{form.content.length.toLocaleString()} characters</span>

              <span>Markdown supported</span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 border-t border-border/30" />

          {/* Controls */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4 items-start">
            {/* Slides */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground/80">
                Slides: {form.slideCount}
              </Label>

              <div className="flex h-10 items-center">
                <Slider
                  value={[form.slideCount]}
                  onValueChange={([v]) =>
                    setForm((s) => ({
                      ...s,
                      slideCount: v,
                    }))
                  }
                  min={3}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Style */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground/80">
                Style
              </Label>

              <Select
                value={form.style}
                onValueChange={(value) =>
                  setForm((s) => ({
                    ...s,
                    style: value as HomeFormState['style'],
                  }))
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl border border-border/50 bg-background/40 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:border-primary hover:bg-primary/5 focus:border-primary focus:ring-2 focus:ring-primary/20 data-[state=open]:border-primary data-[state=open]:bg-primary/5">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="glass border border-primary/20">
                  {SLIDE_STYLES.map((style) => (
                    <SelectItem
                      key={style.value}
                      value={style.value}
                      className="cursor-pointer rounded-md transition-colors focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                    >
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tone */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground/80">
                Tone
              </Label>

              <Select
                value={form.tone}
                onValueChange={(value) =>
                  setForm((s) => ({
                    ...s,
                    tone: value as HomeFormState['tone'],
                  }))
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl border border-border/50 bg-background/40 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:border-primary hover:bg-primary/5 focus:border-primary focus:ring-2 focus:ring-primary/20 data-[state=open]:border-primary data-[state=open]:bg-primary/5">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="glass border border-primary/20">
                  {TONE_OPTIONS.map((tone) => (
                    <SelectItem
                      key={tone.value}
                      value={tone.value}
                      className="cursor-pointer rounded-md transition-colors focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                    >
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Layout */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground/80">
                Layout
              </Label>

              <Select
                value={form.layout}
                onValueChange={(value) =>
                  setForm((s) => ({
                    ...s,
                    layout: value as HomeFormState['layout'],
                  }))
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl border border-border/50 bg-background/40 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:border-primary hover:bg-primary/5 focus:border-primary focus:ring-2 focus:ring-primary/20 data-[state=open]:border-primary data-[state=open]:bg-primary/5">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="glass border border-primary/20">
                  {LAYOUT_OPTIONS.map((layout) => (
                    <SelectItem
                      key={layout.value}
                      value={layout.value}
                      className="cursor-pointer rounded-md transition-colors focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                    >
                      {layout.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-5 flex justify-end">
            <Button
              onClick={() => {}}
              className="h-10 rounded-xl px-5 text-sm font-medium"
            >
              <Wand2 className="mr-2 size-4" />
              Generate PPT
            </Button>
          </div>
        </div>
        {/* Templates */}
        <div className="mt-8">
          <p className="text-center text-sm text-muted-foreground mb-3">
            Try a template
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESENTATION_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setForm({
                    content: template.content,
                    slideCount: template.slides,
                    style: template.style,
                    tone: template.tone,
                    layout: template.layout,
                  })
                }}
                className="px-4 py-2 text-sm rounded-full border border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
