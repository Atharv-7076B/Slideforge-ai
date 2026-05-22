import { Presentation, Sparkles, Wand2, Layers, Check, Sun, Moon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')

    const handleThemeChange = () => {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      setTheme(current)
    }

    window.addEventListener('theme-change', handleThemeChange)
    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.dispatchEvent(new Event('theme-change'))
  }

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] dark:bg-[#050506] text-zinc-900 dark:text-white relative overflow-hidden flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 select-none transition-colors duration-300">
      
      {/* Absolute Theme Toggle at Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="size-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/60 text-zinc-650 dark:text-zinc-300 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm backdrop-blur"
        >
          {theme === 'dark' ? (
            <Sun className="size-4.5" />
          ) : (
            <Moon className="size-4.5" />
          )}
        </button>
      </div>

      {/* Soft animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Dim ambient orange glow (#f97316) */}
      <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#f97316]/2 dark:bg-[#f97316]/3 rounded-full filter blur-[150px] pointer-events-none z-0 transition-opacity" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Section: Immersive Brand, Hero Content & Visual Mockup */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between space-y-12">
          
          {/* Logo Branding */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <div className="size-9 rounded-xl bg-[#f97316] flex items-center justify-center shadow-lg shadow-[#f97316]/10 transition-transform group-hover:scale-[1.03]">
                <Presentation className="size-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-zinc-900 dark:text-white tracking-tight">
                SlideForge<span className="text-[#f97316]">.ai</span>
              </span>
            </Link>
          </div>

          {/* Immersive Slide Mockup Canvas */}
          <div className="relative w-full max-w-md mx-auto py-4">
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full aspect-[16/10] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-3 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all duration-300"
            >
              {/* Mockup Toolbar */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900/60">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wide px-2 py-0.5 rounded bg-zinc-55 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/40">
                  slideforge.ai/editor
                </div>
                <div className="size-4" />
              </div>

              {/* Slide Layout Body */}
              <div className="pt-3 h-[calc(100%-1.5rem)] flex flex-col justify-between text-left">
                {/* Top Row: Tag & Title */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[8px] font-semibold text-[#f97316] font-mono uppercase tracking-wider">
                    <Sparkles className="size-2.5" />
                    <span>AI Structure Synthesis</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                    Modern Presentation Frameworks
                  </h3>
                </div>

                {/* Split layout inside preview */}
                <div className="grid grid-cols-12 gap-3 my-2 items-center">
                  <div className="col-span-7 space-y-1.5">
                    <div className="p-1.5 rounded border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-[8px] text-zinc-500 dark:text-zinc-400 flex gap-1 items-start">
                      <Check className="size-2.5 text-[#f97316] shrink-0 mt-0.5" />
                      <span>Synthesizes raw outlines into visual cards.</span>
                    </div>
                    <div className="p-1.5 rounded border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-[8px] text-zinc-500 dark:text-zinc-400 flex gap-1 items-start">
                      <Check className="size-2.5 text-[#f97316] shrink-0 mt-0.5" />
                      <span>Adapts color schemes automatically in real-time.</span>
                    </div>
                  </div>
                  
                  {/* Image Preview Block */}
                  <div className="col-span-5 aspect-[4/3] rounded-lg border border-zinc-150 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-900/60 overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" 
                      alt="Presentation Visual Mockup" 
                      className="w-full h-full object-cover opacity-80 dark:opacity-40 mix-blend-normal dark:mix-blend-luminosity" 
                    />
                  </div>
                </div>

                {/* Slide Footer */}
                <div className="flex justify-between items-center text-[7px] text-zinc-400 dark:text-zinc-600 border-t border-zinc-100 dark:border-zinc-900/80 pt-2 font-mono">
                  <span>Layout: 16:9 Widescreen</span>
                  <span className="flex items-center gap-0.5 text-zinc-500">
                    <Wand2 className="size-2 text-[#f97316]" /> SlideForge Engine
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Tiny Floating Labels */}
            {/* Floating Label 1: AI Presentation (Top Left) */}
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -top-3 -left-5 bg-white dark:bg-zinc-905 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full shadow-md dark:shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="size-2.5 text-[#f97316]" />
              <span className="text-[9px] text-zinc-650 dark:text-zinc-300 font-medium">AI Presentation</span>
            </motion.div>

            {/* Floating Label 2: Smart Layouts (Bottom Right) */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 2.5 }}
              className="absolute -bottom-2 -right-3 bg-white dark:bg-zinc-905 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full shadow-md dark:shadow-lg flex items-center gap-1.5"
            >
              <Layers className="size-2.5 text-[#f97316]" />
              <span className="text-[9px] text-zinc-650 dark:text-zinc-300 font-medium">Smart Layouts</span>
            </motion.div>

            {/* Floating Label 3: Auto Design (Top Right) */}
            <motion.div 
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.5 }}
              className="absolute -top-1 -right-6 bg-white dark:bg-zinc-905 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full shadow-md dark:shadow-lg flex items-center gap-1.5"
            >
              <Wand2 className="size-2.5 text-[#f97316]" />
              <span className="text-[9px] text-zinc-650 dark:text-zinc-300 font-medium">Auto Design</span>
            </motion.div>
          </div>

          {/* Hero Content text */}
          <div className="space-y-6 text-left">
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Create AI Presentations in Seconds
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md font-normal">
                Generate beautiful presentation decks with AI-powered storytelling and smart layouts.
              </p>
            </div>

            {/* Minimal Feature List */}
            <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-900/60 max-w-sm">
              <div className="flex items-center gap-2.5 text-zinc-650 dark:text-zinc-300 text-xs">
                <span className="text-[#f97316] font-semibold text-sm">✓</span>
                <span>AI-powered slide generation</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-650 dark:text-zinc-300 text-xs">
                <span className="text-[#f97316] font-semibold text-sm">✓</span>
                <span>Export to PowerPoint</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-650 dark:text-zinc-300 text-xs">
                <span className="text-[#f97316] font-semibold text-sm">✓</span>
                <span>Beautiful layouts instantly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Centered Floating Auth Card */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
