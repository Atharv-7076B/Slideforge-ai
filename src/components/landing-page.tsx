import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Wand2, 
  Layout, 
  Download, 
  Check, 
  ArrowRight, 
  Play, 
  FileText, 
  Layers, 
  Github, 
  Twitter, 
  Linkedin, 
  ChevronRight,
  Loader2,
  ArrowUpRight,
  Eye,
  Settings
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

// --- CORE TYPES ---
interface Template {
  id: string
  name: string
  accentColor: string
  bg: string
  textAccent: string
  title: string
  desc: string
  slideContent: {
    tag: string
    headline: string
    bullet1: string
    bullet2: string
    image: string
  }
}

// --- MOCK DATA ---
const TRUSTED_METRICS = [
  { value: '100k+', label: 'Presentations Generated' },
  { value: '98%', label: 'Faster Workflow' },
  { value: 'Trusted by modern teams', label: 'across scaling startups' }
]

const COMPANY_LOGOS = [
  { name: 'Acme', svg: (
    <svg className="h-5 w-auto text-zinc-400 dark:text-zinc-500 fill-current opacity-70 hover:opacity-100 hover:text-zinc-900 dark:hover:text-zinc-350 transition-all duration-300" viewBox="0 0 120 30">
      <path d="M15 5 L25 25 L5 25 Z" />
      <text x="35" y="20" className="font-bold text-sm tracking-widest uppercase">ACME</text>
    </svg>
  )},
  { name: 'Globex', svg: (
    <svg className="h-5 w-auto text-zinc-400 dark:text-zinc-500 fill-current opacity-70 hover:opacity-100 hover:text-zinc-900 dark:hover:text-zinc-350 transition-all duration-300" viewBox="0 0 120 30">
      <path d="M5 15 Q 15 5, 25 15 T 45 15" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <text x="55" y="20" className="font-bold text-sm tracking-widest uppercase">GLOBEX</text>
    </svg>
  )},
  { name: 'Initech', svg: (
    <svg className="h-5 w-auto text-zinc-400 dark:text-zinc-500 fill-current opacity-70 hover:opacity-100 hover:text-zinc-900 dark:hover:text-zinc-350 transition-all duration-300" viewBox="0 0 120 30">
      <circle cx="15" cy="15" r="9" strokeWidth="2.5" fill="none" stroke="currentColor" />
      <circle cx="15" cy="15" r="3.5" fill="currentColor" />
      <text x="35" y="20" className="font-bold text-sm tracking-widest uppercase">INITECH</text>
    </svg>
  )},
  { name: 'TechCorp', svg: (
    <svg className="h-5 w-auto text-zinc-400 dark:text-zinc-500 fill-current opacity-70 hover:opacity-100 hover:text-zinc-900 dark:hover:text-zinc-350 transition-all duration-300" viewBox="0 0 120 30">
      <rect x="5" y="5" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9 14 L19 14" stroke="currentColor" strokeWidth="1.5" />
      <text x="32" y="20" className="font-bold text-sm tracking-widest uppercase">TECH</text>
    </svg>
  )}
]

const CORE_FEATURES = [
  {
    icon: Wand2,
    title: 'AI Slide Generation',
    desc: 'Transform raw notes, prompts, or doc outlines into premium balanced decks in seconds.'
  },
  {
    icon: Layout,
    title: 'Smart Layout Engine',
    desc: 'Widescreen layouts automatically balance margins, visuals, and font hierarchies dynamically.'
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    desc: 'Download fully native, editable widescreen PowerPoint presentations and vector PDF sheets.'
  },
  {
    icon: Layers,
    title: 'Presentation Templates',
    desc: 'Swap designs, color schemes, and layouts globally while preserving your narrative structure.'
  }
]

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Enter Topic',
    desc: 'Paste notes or describe your presentation goals inside our clean generation console.'
  },
  {
    number: '02',
    title: 'AI Generates Slides',
    desc: 'The storytelling model maps paragraphs to visual structures and generates 16:9 cards.'
  },
  {
    number: '03',
    title: 'Customize & Export',
    desc: 'Tune layout parameters, modify slide content, and download native editable PPTX slides.'
  }
]

const TEMPLATES: Template[] = [
  {
    id: 'minimal-tech',
    name: 'Minimal Tech',
    accentColor: '#f97316',
    textAccent: 'text-[#f97316]',
    bg: 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
    title: 'Clean Minimal Tech',
    desc: 'Sleek dark layout designed for technical project reviews, documentation, and product roadmaps.',
    slideContent: {
      tag: 'ARCHITECTURE',
      headline: 'Sub-second Edge Synthesizer',
      bullet1: 'Distributed read replicas for minimal latency',
      bullet2: 'Edge cached database operations with CDN function hooks',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'enterprise-pitch',
    name: 'Enterprise Pitch',
    accentColor: '#ef4444',
    textAccent: 'text-red-500',
    bg: 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
    title: 'Venture Boardroom Deck',
    desc: 'High-contrast elegant structure optimized to deliver investment milestones and close series funding.',
    slideContent: {
      tag: 'FINANCIAL HIGHLIGHTS',
      headline: 'Scaling to $10M ARR in Year 2',
      bullet1: 'Gross margins holding strong at 84% average',
      bullet2: 'Net revenue retention reaches 138% across enterprise tiers',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    accentColor: '#8b5cf6',
    textAccent: 'text-violet-500',
    bg: 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
    title: 'Brand Showcase Design',
    desc: 'Artistic font settings and generous whitespace configurations made for design teams and creators.',
    slideContent: {
      tag: 'CREATIVE BLUEPRINT',
      headline: 'A Modern Visual Renaissance',
      bullet1: 'Dynamic grid structures that automatically resize',
      bullet2: 'Bespoke contrast pallets optimized for modern monitors',
      image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'startup-deck',
    name: 'Startup Deck',
    accentColor: '#10b981',
    textAccent: 'text-emerald-500',
    bg: 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
    title: 'Fast Seed Pitch Deck',
    desc: 'Action-oriented layouts and crisp content grids designed for rapid seed pitches and product demos.',
    slideContent: {
      tag: 'MARKET OPPORTUNITY',
      headline: 'Disrupting Legacy Slide Editing',
      bullet1: 'Eliminate manual dragging and visual resizing stress',
      bullet2: '10x design speed improvement with structured narrative engines',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80'
    }
  }
]

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const initial = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    setTheme(initial)

    const handleThemeChange = () => {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      setTheme(current)
    }

    window.addEventListener('theme-change', handleThemeChange)
    return () => window.removeEventListener('theme-change', handleThemeChange)
  }, [])

  // --- HERO WORKSPACE STATES ---
  const [heroPrompt, setHeroPrompt] = useState('Create a product overview slide deck detailing our AI synthesis model, widescreen margins, and export capabilities.')
  const [isHeroGenerating, setIsHeroGenerating] = useState(false)
  const [heroProgress, setHeroProgress] = useState(0)
  const [heroSlideIdx, setHeroSlideIdx] = useState(0)
  const [heroThemeColor, setHeroThemeColor] = useState<'orange' | 'violet' | 'emerald'>('orange')
  const [isHeroExporting, setIsHeroExporting] = useState(false)
  const [heroExportProgress, setHeroExportProgress] = useState(0)

  const HERO_SLIDES = [
    {
      tag: 'SLIDE 01 / STORYTELLING',
      title: 'AI Presentation Storyboards',
      bullets: [
        'Converts complex outline text into proportional layouts.',
        'Automatically balances visual weights and textual content.'
      ]
    },
    {
      tag: 'SLIDE 02 / DESIGN ENGINE',
      title: 'Smart Layout Automation',
      bullets: [
        'Responsive grids adapt margins and padding coordinates.',
        'Theme matching scales contrast ratios for high readability.'
      ]
    },
    {
      tag: 'SLIDE 03 / PORTABILITY',
      title: 'Vector PowerPoint Exports',
      bullets: [
        'Compiles slides into fully editable shapes and texts.',
        'Zero design breakage during offline local presentations.'
      ]
    }
  ]

  const runHeroGeneration = () => {
    if (isHeroGenerating) return
    setIsHeroGenerating(true)
    setHeroProgress(0)

    const interval = setInterval(() => {
      setHeroProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsHeroGenerating(false)
            setHeroProgress(0)
            toast.success('AI slides synthesized successfully!')
            setHeroSlideIdx((prev) => (prev + 1) % 3)
          }, 1000)
          return 100
        }
        return p + 5
      })
    }, 60)
  }

  const runHeroExport = () => {
    if (isHeroExporting) return
    setIsHeroExporting(true)
    setHeroExportProgress(0)

    const interval = setInterval(() => {
      setHeroExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsHeroExporting(false)
            setHeroExportProgress(0)
            toast.success('PPTX Presentation exported successfully!')
          }, 600)
          return 100
        }
        return p + 20
      })
    }, 100)
  }

  // --- INTERACTIVE SHOWCASE STATES ---
  const [showcaseTab, setShowcaseTab] = useState<'ai' | 'edit' | 'theme' | 'export'>('ai')
  const [showcaseProgress, setShowcaseProgress] = useState(0)
  const [isShowcaseGenerating, setIsShowcaseGenerating] = useState(false)

  // Edit slide live states
  const [slideTitle, setSlideTitle] = useState('Architecting for Infinite Scale')
  const [slideBullet1, setSlideBullet1] = useState('Redundant cloud databases globally distributed')
  const [slideBullet2, setSlideBullet2] = useState('99.99% core application uptime SLA')

  // Theme adapter state
  const [showcaseThemeIdx, setShowcaseThemeIdx] = useState(0)

  // Export overlay state
  const [showcaseExportModal, setShowcaseExportModal] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const triggerShowcaseGeneration = () => {
    if (isShowcaseGenerating) return
    setIsShowcaseGenerating(true)
    setShowcaseProgress(0)
    const interval = setInterval(() => {
      setShowcaseProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsShowcaseGenerating(false), 800)
          return 100
        }
        return p + 5
      })
    }, 70)
  }

  const triggerExportSimulation = () => {
    if (isExporting) return
    setIsExporting(true)
    setExportProgress(0)
    setShowcaseExportModal(true)
    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExporting(false)
            toast.success('PPTX File exported! Check downloads.')
          }, 800)
          return 100
        }
        return p + 10
      })
    }, 150)
  }

  // --- TEMPLATES SHOWCASE ---
  const [activeTemplate, setActiveTemplate] = useState<Template>(TEMPLATES[0])

  return (
    <div className="min-h-screen bg-white dark:bg-[#050506] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-x-hidden selection:bg-[#f97316]/20 selection:text-[#f97316]">
      
      {/* Background Subtle Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.012)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Orange Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#f97316]/2 dark:bg-[#f97316]/3 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative z-10 pt-36 pb-24 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Tag Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-650 dark:text-zinc-300"
            >
              <Sparkles className="size-3.5 text-[#f97316]" />
              <span className="tracking-wide">Introducing SlideForge 2.0</span>
            </motion.div>

            {/* Bold Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-zinc-900 dark:text-white"
            >
              Create Presentation <br className="hidden sm:inline" />
              Decks That Look <br />
              Professionally Designed
            </motion.h1>

            {/* Short Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed font-normal"
            >
              Generate clean, modern presentations with AI-powered storytelling, smart layouts, and instant exports.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Button asChild size="lg" className="rounded-xl h-11 px-6 font-semibold bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg shadow-[#f97316]/10 transition-colors">
                <Link to="/signup">
                  Generate Presentation
                  <Wand2 className="ml-2 size-4" />
                </Link>
              </Button>
              
              <a 
                href="#showcase" 
                className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-white transition-all h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <Play className="size-3.5 fill-current" />
                See Example Deck
              </a>
            </motion.div>

            {/* Trust Line */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-zinc-400 dark:text-zinc-500 font-medium"
            >
              Used by students, startups, and creators
            </motion.p>
          </div>

          {/* Right Column: Clean Editor Mockup */}
          <div className="lg:col-span-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-xl dark:shadow-2xl backdrop-blur-sm transition-colors duration-300"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-zinc-100 dark:border-zinc-900/60">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono tracking-wide px-3 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/40">
                  slideforge.ai/editor
                </div>
                
                {/* Export Button */}
                <button
                  onClick={runHeroExport}
                  disabled={isHeroExporting || isHeroGenerating}
                  className="flex items-center gap-1 px-2.5 py-0.5 h-6 rounded bg-[#f97316] text-white hover:bg-[#ea580c] transition-all font-sans font-bold text-[9px] disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isHeroExporting ? (
                    <>
                      <Loader2 className="size-2.5 animate-spin" />
                      <span>{heroExportProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-2.5" />
                      <span>Export</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mockup Workspace */}
              <div className="grid grid-cols-12 gap-3.5 p-3 text-left">
                {/* Left Side: AI Panel & Template Switcher */}
                <div className="col-span-5 border border-zinc-150 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between h-[250px] transition-colors">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Sparkles className="size-3 text-[#f97316]" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">AI Console</span>
                      </div>
                      <span className="text-[7px] text-zinc-400 dark:text-zinc-550 font-mono">v2.0</span>
                    </div>

                    {/* Prompt Box */}
                    <div className="space-y-1">
                      <textarea
                        value={heroPrompt}
                        onChange={(e) => setHeroPrompt(e.target.value)}
                        placeholder="Type a prompt to build slides..."
                        className="w-full h-[80px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2 text-[8.5px] leading-normal text-zinc-700 dark:text-zinc-300 resize-none outline-none focus:border-[#f97316] transition-colors"
                      />
                    </div>

                    {/* Template Theme Switcher */}
                    <div className="space-y-1">
                      <p className="text-[8px] font-semibold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider">Templates</p>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'orange', label: 'Orange', bg: 'bg-[#f97316]' },
                          { id: 'violet', label: 'Violet', bg: 'bg-[#8b5cf6]' },
                          { id: 'emerald', label: 'Emerald', bg: 'bg-[#10b981]' }
                        ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setHeroThemeColor(c.id as any)}
                            className={`size-4 rounded-full border transition-all ${
                              heroThemeColor === c.id ? 'border-zinc-800 dark:border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            title={`Switch to ${c.label} style`}
                          >
                            <span className={`size-2.5 rounded-full ${c.bg} block mx-auto`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate CTA */}
                  <div>
                    <button 
                      onClick={runHeroGeneration}
                      disabled={isHeroGenerating}
                      className="w-full h-8 rounded-lg bg-[#f97316] text-white font-bold text-[9px] flex items-center justify-center gap-1 hover:bg-[#ea580c] transition-colors shadow-sm shadow-[#f97316]/10 disabled:opacity-80"
                    >
                      {isHeroGenerating ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          <span>Generating ({heroProgress}%)</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="size-3" />
                          <span>Generate Deck</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Side: Minimal Presentation Preview & Slide Thumbnails */}
                <div className="col-span-7 flex flex-col justify-between h-[250px]">
                  
                  {/* Presentation Preview Canvas */}
                  <div className={`aspect-[16/9.5] w-full rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/40 dark:bg-[#07070a] relative overflow-hidden flex flex-col justify-between p-3.5 transition-all duration-300 shadow-sm ${
                    heroThemeColor === 'orange' ? 'shadow-[#f97316]/3 dark:shadow-none' : 
                    heroThemeColor === 'violet' ? 'shadow-[#8b5cf6]/3 dark:shadow-none' : 
                    'shadow-[#10b981]/3 dark:shadow-none'
                  }`}>
                    
                    {/* Decorative color glow based on selected theme */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--glow-color),transparent_60%)] pointer-events-none" style={{
                      ['--glow-color' as any]: heroThemeColor === 'orange' ? 'rgba(249,115,22,0.04)' :
                                              heroThemeColor === 'violet' ? 'rgba(139,92,246,0.04)' :
                                              'rgba(16,185,129,0.04)'
                    }} />

                    {/* Slide Header */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className={`text-[6.5px] font-bold tracking-widest uppercase font-mono transition-colors ${
                        heroThemeColor === 'orange' ? 'text-[#f97316]' :
                        heroThemeColor === 'violet' ? 'text-[#8b5cf6]' :
                        'text-[#10b981]'
                      }`}>
                        {HERO_SLIDES[heroSlideIdx].tag}
                      </span>
                      <div className="size-3.5 rounded bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center text-[6px] text-zinc-400 dark:text-zinc-550 font-mono">
                        SF
                      </div>
                    </div>

                    {/* Slide Content */}
                    <div className="space-y-1.5 relative z-10 my-auto text-left">
                      <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white leading-tight">
                        {isHeroGenerating ? (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Loader2 className="size-2.5 animate-spin text-[#f97316]" />
                            <span>Synthesizing slides...</span>
                          </span>
                        ) : (
                          HERO_SLIDES[heroSlideIdx].title
                        )}
                      </h3>
                      <div className="space-y-1 max-w-[95%]">
                        {HERO_SLIDES[heroSlideIdx].bullets.map((b, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <Check className={`size-2 shrink-0 mt-0.5 ${
                              heroThemeColor === 'orange' ? 'text-[#f97316]' :
                              heroThemeColor === 'violet' ? 'text-[#8b5cf6]' :
                              'text-[#10b981]'
                            }`} />
                            <p className="text-[7.5px] text-zinc-550 dark:text-zinc-400 leading-relaxed">
                              {b}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Slide Footer */}
                    <div className="flex items-center justify-between text-[5.5px] text-zinc-450 dark:text-zinc-600 relative z-10 border-t border-zinc-150 dark:border-zinc-900 pt-1 font-mono">
                      <span>Confidential SlideForge AI</span>
                      <span>Page {heroSlideIdx + 1} of 3</span>
                    </div>
                  </div>

                  {/* Slide Thumbnails Selector Row */}
                  <div className="space-y-1 pt-1.5">
                    <p className="text-[7.5px] font-semibold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">Slide Navigator</p>
                    <div className="grid grid-cols-3 gap-2">
                      {HERO_SLIDES.map((slide, idx) => (
                        <button
                          key={idx}
                          onClick={() => setHeroSlideIdx(idx)}
                          className={`aspect-video rounded-lg border bg-zinc-50/50 dark:bg-zinc-950 p-1.5 text-left flex flex-col justify-between transition-all hover:scale-[1.02] ${
                            heroSlideIdx === idx 
                              ? heroThemeColor === 'orange' ? 'border-[#f97316] ring-1 ring-[#f97316]/20' :
                                heroThemeColor === 'violet' ? 'border-[#8b5cf6] ring-1 ring-[#8b5cf6]/20' :
                                'border-[#10b981] ring-1 ring-[#10b981]/20'
                              : 'border-zinc-200 dark:border-zinc-850 hover:border-zinc-350 dark:hover:border-zinc-800'
                          }`}
                        >
                          <span className="text-[5.5px] font-bold text-zinc-400 dark:text-zinc-650 font-mono">0{idx + 1}</span>
                          <span className="text-[5px] text-zinc-600 dark:text-zinc-450 font-bold truncate tracking-tight">{slide.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Labels */}
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="size-2 text-[#f97316]" />
                <span className="text-[8px] text-zinc-650 dark:text-zinc-300 font-medium">AI Presentation</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-2 -left-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5"
              >
                <Layout className="size-2 text-[#f97316]" />
                <span className="text-[8px] text-zinc-650 dark:text-zinc-300 font-medium">Smart Layouts</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-5 -left-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5"
              >
                <Wand2 className="size-2 text-[#f97316]" />
                <span className="text-[8px] text-zinc-650 dark:text-zinc-300 font-medium">Auto Design</span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ==================== SOCIAL PROOF ==================== */}
      <section className="border-y border-zinc-200/60 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/40 py-16 px-6 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12 text-center md:text-left">
            {TRUSTED_METRICS.map((metric, i) => (
              <div key={i} className="space-y-0.5">
                <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{metric.value}</p>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest font-mono">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="hidden md:block w-px h-10 bg-zinc-200 dark:bg-zinc-850" />

          {/* Grayscale company logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
            {COMPANY_LOGOS.map((logo, i) => (
              <div key={i} className="h-5 flex items-center">
                {logo.svg}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==================== CORE FEATURES (ONLY 4 CARDS) ==================== */}
      <section id="features" className="py-28 px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-[#f97316] uppercase tracking-widest font-mono">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Designed for professional visual stories
          </h2>
          <p className="text-zinc-550 dark:text-zinc-450 max-w-lg mx-auto text-sm leading-relaxed">
            SlideForge operations go beyond templated layouts. Every generated slide is analyzed dynamically to optimize balance, contrast, and structure.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {CORE_FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div 
                key={idx}
                whileHover={{ y: -3 }}
                className="group relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 hover:border-[#f97316]/30 dark:hover:border-[#f97316]/20 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                {/* Glow underlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.015),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="space-y-4 relative z-10 text-left">
                  {/* Icon */}
                  <div className="size-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-650 dark:text-zinc-450 group-hover:text-[#f97316] group-hover:border-[#f97316]/20 transition-colors">
                    <Icon className="size-5" />
                  </div>
                  
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ==================== INTERACTIVE PRODUCT SHOWCASE ==================== */}
      <section id="showcase" className="py-28 bg-zinc-50/50 dark:bg-zinc-950/20 border-y border-zinc-200/50 dark:border-zinc-900 px-6 transition-colors duration-300">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#f97316] uppercase tracking-widest font-mono">Interactive Walkthrough</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Experience the SlideForge workspace
            </h2>
            <p className="text-zinc-550 dark:text-zinc-450 text-sm leading-relaxed">
              Explore how SlideForge handles outlines, content revisions, responsive styles, and high-performance compilations inside the web app.
            </p>
          </div>

          {/* Interactive Workspace Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Left selector steps */}
            <div className="col-span-1 lg:col-span-4 flex flex-row lg:flex-col justify-start gap-3 overflow-x-auto scrollbar-hide py-1">
              {[
                { id: 'ai', label: 'AI Generator', desc: 'Synthesize outlines automatically.' },
                { id: 'edit', label: 'Slide Editor', desc: 'Direct text manipulation on canvas.' },
                { id: 'theme', label: 'Theme Adapters', desc: 'Adapt typography and color palettes.' },
                { id: 'export', label: 'Widescreen Export', desc: 'Compile native PPTX/PDF files.' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setShowcaseTab(tab.id as any)}
                  className={`w-full text-left p-4 rounded-xl border transition-all shrink-0 sm:shrink ${
                    showcaseTab === tab.id
                      ? 'border-[#f97316]/30 bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white font-medium'
                      : 'border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    {tab.id === 'ai' && <Wand2 className="size-3.5 text-[#f97316]" />}
                    {tab.id === 'edit' && <FileText className="size-3.5 text-[#f97316]" />}
                    {tab.id === 'theme' && <Settings className="size-3.5 text-[#f97316]" />}
                    {tab.id === 'export' && <Download className="size-3.5 text-[#f97316]" />}
                    {tab.label}
                  </p>
                  <p className="hidden lg:block text-[11px] text-zinc-400 dark:text-zinc-500 font-normal mt-1 leading-normal">
                    {tab.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Right Display Mockup */}
            <div className="col-span-1 lg:col-span-8 flex flex-col">
              <div className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-xl flex flex-col justify-between text-left relative overflow-hidden transition-colors duration-300 min-h-[300px]">
                
                {/* Simulated Address Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wide px-3 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/40">
                    slideforge.ai/dashboard/showcase
                  </div>
                  <div className="size-3.5" />
                </div>

                {/* Live Content Workspace */}
                <div className="flex-1 py-4 flex flex-col justify-center relative">
                  
                  {/* TAB 1: AI GENERATION */}
                  {showcaseTab === 'ai' && (
                    <div className="space-y-4 max-w-md mx-auto w-full">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider font-mono">Outline Outline Prompt</label>
                        <textarea
                          readOnly
                          value="Create a quarterly metrics review deck detailing our 3.5x scale, cloud infrastructure updates, and security certifications."
                          className="w-full h-16 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-300 resize-none font-mono outline-none"
                        />
                      </div>

                      {isShowcaseGenerating ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                            <span>Generating layouts and elements...</span>
                            <span>{showcaseProgress}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#f97316] h-1.5 rounded-full transition-all duration-70" style={{ width: `${showcaseProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={triggerShowcaseGeneration}
                          className="px-4 py-2 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white text-[10px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-[#f97316]/10"
                        >
                          <Wand2 className="size-3" />
                          Simulate AI Generation
                        </button>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SLIDE EDITING */}
                  {showcaseTab === 'edit' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center w-full">
                      {/* Left: inputs */}
                      <div className="space-y-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase">Slide Headline</label>
                          <input
                            type="text"
                            value={slideTitle}
                            onChange={(e) => setSlideTitle(e.target.value)}
                            className="w-full h-8 px-2 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[10px] text-zinc-800 dark:text-white outline-none focus:border-[#f97316]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase">Bullet Point 1</label>
                          <input
                            type="text"
                            value={slideBullet1}
                            onChange={(e) => setSlideBullet1(e.target.value)}
                            className="w-full h-8 px-2 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[10px] text-zinc-800 dark:text-white outline-none focus:border-[#f97316]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase">Bullet Point 2</label>
                          <input
                            type="text"
                            value={slideBullet2}
                            onChange={(e) => setSlideBullet2(e.target.value)}
                            className="w-full h-8 px-2 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[10px] text-zinc-800 dark:text-white outline-none focus:border-[#f97316]"
                          />
                        </div>
                      </div>

                      {/* Right: preview */}
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/40 relative aspect-video flex flex-col justify-between">
                        <span className="text-[6px] font-bold text-[#f97316] font-mono tracking-widest">LIVE EDITOR PREVIEW</span>
                        <div className="space-y-1 text-left my-auto">
                          <h4 className="text-[10px] sm:text-xs font-bold text-zinc-900 dark:text-white">{slideTitle || 'Untitled Slide'}</h4>
                          <ul className="space-y-1">
                            <li className="text-[7.5px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <span className="text-[#f97316] font-bold">•</span> {slideBullet1}
                            </li>
                            <li className="text-[7.5px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <span className="text-[#f97316] font-bold">•</span> {slideBullet2}
                            </li>
                          </ul>
                        </div>
                        <div className="flex justify-between items-center text-[5px] text-zinc-400 dark:text-zinc-650 border-t border-zinc-200 dark:border-zinc-900 pt-1">
                          <span>16:9 Widescreen Layout</span>
                          <span>Page 2</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: THEME ADAPTERS */}
                  {showcaseTab === 'theme' && (
                    <div className="space-y-4 w-full text-center">
                      <div className="flex justify-center gap-3">
                        {[
                          { name: 'Warm Amber', color: 'bg-amber-500', text: 'text-amber-500', hex: '#f59e0b' },
                          { name: 'Creative Violet', color: 'bg-violet-500', text: 'text-violet-500', hex: '#8b5cf6' },
                          { name: 'Startup Green', color: 'bg-emerald-500', text: 'text-emerald-500', hex: '#10b981' },
                          { name: 'Widescreen Blue', color: 'bg-sky-500', text: 'text-sky-500', hex: '#0ea5e9' }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setShowcaseThemeIdx(idx)}
                            className={`size-8 rounded-full flex items-center justify-center border transition-all ${
                              showcaseThemeIdx === idx ? 'border-zinc-400 dark:border-white scale-110' : 'border-transparent'
                            }`}
                          >
                            <span className={`size-6 rounded-full ${item.color} block`} />
                          </button>
                        ))}
                      </div>

                      {/* Display of selected slide theme */}
                      <div className="p-4 max-w-sm mx-auto rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/40 aspect-video flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-[6.5px] font-bold font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Theme Synth</span>
                          <span className={`text-[6.5px] font-bold font-mono tracking-wide`} style={{ color: [ '#f59e0b', '#8b5cf6', '#10b981', '#0ea5e9' ][showcaseThemeIdx] }}>Active Scheme</span>
                        </div>
                        <div className="space-y-1.5 text-left my-auto">
                          <h4 className="text-[11px] font-bold text-zinc-900 dark:text-white">Theme-Aware Presentation Grids</h4>
                          <p className="text-[8px] text-zinc-500 dark:text-zinc-400">Fonts and alignments dynamically adapt based on background color coordinates.</p>
                        </div>
                        <div className="flex justify-between items-center text-[5.5px] text-zinc-400 dark:text-zinc-650 border-t border-zinc-250 dark:border-zinc-900 pt-1.5">
                          <span>SlideForge Layout Engine</span>
                          <span className="flex items-center gap-0.5">
                            <span className="size-1 rounded-full" style={{ backgroundColor: [ '#f59e0b', '#8b5cf6', '#10b981', '#0ea5e9' ][showcaseThemeIdx] }} />
                            Adaptive CSS
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: WIDESCREEN EXPORT */}
                  {showcaseTab === 'export' && (
                    <div className="space-y-4 max-w-sm mx-auto w-full text-center">
                      <h4 className="text-xs font-semibold text-zinc-850 dark:text-zinc-300">Ready to export to local files?</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">PowerPoint export generates fully editable vectors, vector shapes, and typography.</p>
                      
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={triggerExportSimulation}
                          className="px-4 py-2 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-sm shadow-[#f97316]/10"
                        >
                          <Download className="size-3" />
                          Simulate PPTX Export
                        </button>
                      </div>

                      {/* Export modal dialog */}
                      {showcaseExportModal && (
                        <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-20 flex items-center justify-center p-4">
                          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 w-full max-w-[260px] text-center space-y-3 shadow-lg">
                            <span className="text-[8px] font-bold text-[#f97316] uppercase font-mono tracking-widest">Exporter Active</span>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] text-zinc-500">
                                <span>Exporting slide elements...</span>
                                <span>{exportProgress}%</span>
                              </div>
                              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                                <div className="bg-[#f97316] h-1 rounded-full transition-all" style={{ width: `${exportProgress}%` }} />
                              </div>
                            </div>
                            {exportProgress >= 100 && (
                              <button
                                onClick={() => setShowcaseExportModal(false)}
                                className="h-6 w-full text-[9px] font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded"
                              >
                                Close Modal
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer format indicator */}
                <div className="flex items-center justify-between text-[7px] sm:text-[8px] text-zinc-400 dark:text-zinc-650 border-t border-zinc-100 dark:border-zinc-900/60 pt-2 font-mono">
                  <span>Widescreen Canvas Format</span>
                  <span className="flex items-center gap-0.5">
                    <span className="size-1 rounded-full bg-emerald-500" /> Live Editor Workspace
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-28 bg-white dark:bg-[#050506] border-t border-zinc-200/50 dark:border-zinc-900 px-6 transition-colors duration-300">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-[#f97316] uppercase tracking-widest font-mono">Process Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Three simple steps to final slides
            </h2>
            <p className="text-zinc-550 dark:text-zinc-450 max-w-lg mx-auto text-sm leading-relaxed">
              We focus on narrative simplicity, letting you convert notes and topics into presentation-ready assets in moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 text-left space-y-4 relative shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-zinc-300 dark:text-zinc-800 font-mono">{step.number}</span>
                  <div className="size-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 flex items-center justify-center text-[#f97316]">
                    {idx === 0 && <FileText className="size-4" />}
                    {idx === 1 && <Wand2 className="size-4" />}
                    {idx === 2 && <Download className="size-4" />}
                  </div>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">{step.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-450 leading-relaxed">{step.desc}</p>
                
                {/* Mockup visualization under each step */}
                <div className="pt-2">
                  {idx === 0 && (
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-150 dark:border-zinc-850/60 text-[9px] font-mono text-zinc-450 dark:text-zinc-500">
                      Topic: "AI scaling metrics Q3..."
                    </div>
                  )}
                  {idx === 1 && (
                    <div className="h-6 w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-150 dark:border-zinc-850/60 px-2 flex items-center gap-1.5 animate-pulse">
                      <div className="size-1.5 rounded-full bg-[#f97316] animate-ping" />
                      <span className="text-[9px] font-mono text-zinc-450 dark:text-zinc-550">Compiling outlines...</span>
                    </div>
                  )}
                  {idx === 2 && (
                    <div className="p-1 bg-[#f97316]/5 border border-[#f97316]/10 rounded-lg flex items-center justify-center gap-1 text-[#f97316] text-[9px] font-semibold">
                      <Check className="size-3" /> Ready: export.pptx
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TEMPLATES SECTION ==================== */}
      <section id="templates" className="py-28 px-6 max-w-5xl mx-auto space-y-16 border-t border-zinc-200/50 dark:border-zinc-900">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-[#f97316] uppercase tracking-widest font-mono">Visual Presets</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Curated presentation themes
          </h2>
          <p className="text-zinc-550 dark:text-zinc-450 max-w-lg mx-auto text-sm leading-relaxed">
            Quickly adapt typography guidelines, background accents, grids, and layouts based on your core branding styling.
          </p>
        </div>

        {/* Template Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TEMPLATES.map((t) => (
            <motion.div 
              key={t.id}
              whileHover={{ y: -4 }}
              className="group flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Mini Slide Preview Canvas */}
              <div className={`aspect-[16/10] w-full p-4 sm:p-5 flex flex-col justify-between text-left relative border-b border-zinc-200/60 dark:border-zinc-900 overflow-hidden ${t.bg}`}>
                {/* Slide top */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[7.5px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">{t.slideContent.tag}</span>
                  <span className="text-[7.5px] font-semibold" style={{ color: t.accentColor }}>Slide 02</span>
                </div>

                {/* Slide middle */}
                <div className="grid grid-cols-12 gap-3 items-center relative z-10 my-auto">
                  <div className="col-span-7 space-y-1.5">
                    <h4 className="text-[9.5px] sm:text-[10.5px] font-bold text-zinc-900 dark:text-white leading-tight">
                      {t.slideContent.headline}
                    </h4>
                    <ul className="space-y-1">
                      <li className="flex items-start gap-1 text-[7.5px] text-zinc-500 dark:text-zinc-400">
                        <span className="text-zinc-400 dark:text-zinc-650 mt-0.5">•</span>
                        <span className="truncate">{t.slideContent.bullet1}</span>
                      </li>
                      <li className="flex items-start gap-1 text-[7.5px] text-zinc-500 dark:text-zinc-400">
                        <span className="text-zinc-400 dark:text-zinc-650 mt-0.5">•</span>
                        <span className="truncate">{t.slideContent.bullet2}</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Visual Preview */}
                  <div className="col-span-5 aspect-[16/11] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-center">
                    <img 
                      src={t.slideContent.image} 
                      alt="Template layout image"
                      className="object-cover w-full h-full opacity-90 dark:opacity-85 mix-blend-normal dark:mix-blend-luminosity"
                    />
                  </div>
                </div>

                {/* Slide footer */}
                <div className="flex justify-between items-center text-[6px] text-zinc-400 dark:text-zinc-600 relative z-10 border-t border-zinc-150 dark:border-zinc-900/80 pt-1.5">
                  <span>SlideForge AI Presentation Engine</span>
                  <span>Widescreen 16:9</span>
                </div>
              </div>

              {/* Template Meta Info */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider font-mono" style={{ color: t.accentColor }}>
                    <div className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.accentColor }} />
                    {t.name}
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">{t.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.desc}</p>
                </div>
                
                <div className="pt-2 flex items-center justify-between">
                  <Link 
                    to="/signup" 
                    className="text-xs font-semibold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Use this preset
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section id="pricing" className="py-28 px-6 border-t border-zinc-200/50 dark:border-zinc-900 max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-[#f97316] uppercase tracking-widest font-mono">Simple Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Plans for creators and scale-ups
          </h2>
          <p className="text-zinc-550 dark:text-zinc-450 max-w-lg mx-auto text-sm leading-relaxed">
            Begin drafting presentations for free. Upgrade whenever you need premium image models, enterprise templates, or team workspaces.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Starter Plan */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 flex flex-col justify-between shadow-sm">
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300 font-sans">Starter</h3>
                <p className="text-xs text-zinc-500">Ideal for draft test runs and single assignments.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">$0</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-550 font-normal"> / forever</span>
                </div>
              </div>
              
              <ul className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200/60 dark:border-zinc-900">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>5 Presentations / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>Standard layouts & models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>Basic PDF/PPTX compiles</span>
                </li>
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full rounded-xl mt-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Link to="/login">Sign Up Free</Link>
            </Button>
          </div>

          {/* Pro Creator Plan (Recommended) */}
          <div className="p-6 rounded-2xl border-2 border-[#f97316]/40 dark:border-[#f97316]/40 bg-white dark:bg-zinc-950 relative flex flex-col justify-between shadow-md dark:shadow-2xl">
            {/* Gradient underlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.04),transparent_60%)] pointer-events-none" />
            
            {/* Most Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Most Popular
            </div>

            <div className="space-y-6 text-left relative z-10">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white font-sans">Pro Creator</h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400">Perfect for professionals, startup pitches, and teams.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">$15</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-450 font-normal"> / month</span>
                </div>
              </div>
              
              <ul className="space-y-2.5 text-xs text-zinc-650 dark:text-zinc-300 pt-4 border-t border-zinc-250/60 dark:border-zinc-900/60">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Unlimited presentations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>Fast-track PPTX compilations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>High-res AI image generator suggests</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>Full layout design adaptations</span>
                </li>
              </ul>
            </div>

            <Button asChild className="w-full rounded-xl mt-8 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold text-xs shadow-md shadow-[#f97316]/10 relative z-10">
              <Link to="/login">Get Pro Access</Link>
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 flex flex-col justify-between shadow-sm">
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300 font-sans">Enterprise</h3>
                <p className="text-xs text-zinc-555">Tailored for design agencies, consulting teams, and groups.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">Custom</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-550 font-normal"> / annual</span>
                </div>
              </div>
              
              <ul className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-900">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>Shared workspace team folders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>Custom branding themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#f97316] shrink-0" />
                  <span>Private model integrations</span>
                </li>
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full rounded-xl mt-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Link to="/login">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#050506] py-16 px-6 md:px-8 transition-colors duration-300">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
          
          {/* Logo & Newsletter */}
          <div className="md:col-span-5 space-y-6 text-left">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded bg-[#f97316] flex items-center justify-center">
                <span className="font-bold text-xs text-white">S</span>
              </div>
              <span className="font-bold text-base text-zinc-900 dark:text-white tracking-tight">SlideForge.ai</span>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-normal">
              Structured narrative planning, automated 16:9 widescreen balances, and custom visual suggestions generated instantly.
            </p>

            {/* Newsletter input */}
            <div className="space-y-2 max-w-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-550 font-mono">Newsletter Signup</span>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="h-8 flex-1 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-750 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#f97316]/50"
                />
                <button 
                  onClick={() => toast.success("Subscribed to newsletter!")}
                  className="h-8 px-4 rounded bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div className="md:col-span-2.5 space-y-4 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-550 font-mono">Product</span>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="text-zinc-500 dark:text-zinc-400 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">Generators</Link></li>
              <li><Link to="/login" className="text-zinc-500 dark:text-zinc-400 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">Theme Engine</Link></li>
              <li><Link to="/login" className="text-zinc-500 dark:text-zinc-400 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">PPTX Compiles</Link></li>
            </ul>
          </div>

          {/* Corporate */}
          <div className="md:col-span-2.5 space-y-4 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 font-mono">Resources</span>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">Docs & Guides</a></li>
              <li><a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">Vision Blueprint</a></li>
              <li><a href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">Brand Book</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-2 space-y-4 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-550 font-mono">Connect</span>
            <div className="flex gap-3 text-zinc-450 dark:text-zinc-400">
              <a href="#" className="hover:text-[#f97316] transition-colors" title="Twitter"><Twitter className="size-4" /></a>
              <a href="#" className="hover:text-[#f97316] transition-colors" title="GitHub"><Github className="size-4" /></a>
              <a href="#" className="hover:text-[#f97316] transition-colors" title="LinkedIn"><Linkedin className="size-4" /></a>
            </div>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-550 pt-2 leading-relaxed">
              Support Inquiries:<br />
              <a href="mailto:support@slideforge.ai" className="hover:text-zinc-650 dark:hover:text-zinc-300">support@slideforge.ai</a>
            </p>
          </div>
        </div>

        {/* Footnotes */}
        <div className="max-w-5xl mx-auto border-t border-zinc-200 dark:border-zinc-900/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} SlideForge Inc. All rights reserved.</span>
            <span>•</span>
            <span>React + Tailwind + Vite</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-400 transition-colors">Privacy Statement</a>
            <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
