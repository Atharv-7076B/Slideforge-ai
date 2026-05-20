export type PresentationTheme = {
  bg: string
  text: string
  title: string
  body: string
  accent: string // HEX format
  accentClass: string // Tailwind text class
  card: string
  border: string
  fontFamily: string // CSS font family class
  gradientBg?: string // Gradient background if applicable
  pptxBg: string // HEX format
  pptxText: string // HEX format
  pptxTitle: string // HEX format
  pptxAccent: string // HEX format
  pptxCard: string // HEX format
  pptxCardBorder: string // HEX format
}

export const THEMES: Record<string, PresentationTheme> = {
  professional: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    title: 'text-sky-400 font-sans font-bold tracking-tight',
    body: 'text-slate-300',
    accent: '#38bdf8', // sky-400
    accentClass: 'text-sky-400',
    card: 'bg-slate-800/40 border-slate-700/50 backdrop-blur-md',
    border: 'border-slate-800',
    fontFamily: 'font-sans',
    pptxBg: '#0f172a', // slate-900
    pptxText: '#f1f5f9', // slate-100
    pptxTitle: '#38bdf8', // sky-400
    pptxAccent: '#38bdf8',
    pptxCard: '#1e293b', // slate-800
    pptxCardBorder: '#334155', // slate-700
  },
  futuristic: {
    bg: 'bg-black',
    text: 'text-fuchsia-100',
    title: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 font-mono font-extrabold tracking-widest uppercase',
    body: 'text-fuchsia-200/90',
    accent: '#ec4899', // pink-500
    accentClass: 'text-pink-500',
    card: 'bg-purple-950/20 border-fuchsia-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.15)]',
    border: 'border-fuchsia-950',
    fontFamily: 'font-mono',
    gradientBg: 'bg-gradient-to-br from-black via-zinc-950 to-purple-950',
    pptxBg: '#000000',
    pptxText: '#fdf4ff', // fuchsia-50
    pptxTitle: '#e879f9', // fuchsia-400
    pptxAccent: '#ec4899',
    pptxCard: '#1f002e', // deep purple
    pptxCardBorder: '#d946ef', // fuchsia-500
  },
  creative: {
    bg: 'bg-violet-950',
    text: 'text-indigo-50',
    title: 'text-pink-400 font-serif font-black italic tracking-wide',
    body: 'text-violet-200',
    accent: '#fb7185', // rose-400
    accentClass: 'text-pink-400',
    card: 'bg-violet-900/30 border-violet-500/20 backdrop-blur-sm shadow-xl',
    border: 'border-violet-900',
    fontFamily: 'font-serif',
    gradientBg: 'bg-gradient-to-tr from-violet-950 via-slate-900 to-rose-950',
    pptxBg: '#2e1065', // violet-950
    pptxText: '#faf5ff', // purple-50
    pptxTitle: '#f472b6', // pink-400
    pptxAccent: '#fb7185',
    pptxCard: '#4c1d95', // violet-900
    pptxCardBorder: '#8b5cf6', // violet-500
  },
  minimal: {
    bg: 'bg-zinc-50',
    text: 'text-zinc-900',
    title: 'text-zinc-950 font-sans font-semibold tracking-normal',
    body: 'text-zinc-600',
    accent: '#18181b', // zinc-900
    accentClass: 'text-zinc-900',
    card: 'bg-white border-zinc-200 shadow-xs',
    border: 'border-zinc-200',
    fontFamily: 'font-sans',
    pptxBg: '#fafafa', // zinc-50
    pptxText: '#18181b', // zinc-900
    pptxTitle: '#09090b', // zinc-950
    pptxAccent: '#18181b',
    pptxCard: '#ffffff',
    pptxCardBorder: '#e4e4e7', // zinc-200
  },
  'dark-mode': {
    bg: 'bg-zinc-950',
    text: 'text-zinc-100',
    title: 'text-emerald-400 font-sans font-semibold tracking-wide',
    body: 'text-zinc-300',
    accent: '#10b981', // emerald-500
    accentClass: 'text-emerald-400',
    card: 'bg-zinc-900/50 border-zinc-800/60 backdrop-blur-md',
    border: 'border-zinc-900',
    fontFamily: 'font-sans',
    pptxBg: '#09090b', // zinc-950
    pptxText: '#f4f4f5', // zinc-100
    pptxTitle: '#34d399', // emerald-400
    pptxAccent: '#10b981',
    pptxCard: '#18181b', // zinc-900
    pptxCardBorder: '#27272a', // zinc-800
  },
  corporate: {
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    title: 'text-amber-400 font-sans font-bold uppercase tracking-wider',
    body: 'text-slate-300/95',
    accent: '#fbbf24', // amber-400
    accentClass: 'text-amber-400',
    card: 'bg-slate-900/60 border-slate-800/80',
    border: 'border-slate-900',
    fontFamily: 'font-sans',
    pptxBg: '#020617', // slate-950
    pptxText: '#f8fafc', // slate-50
    pptxTitle: '#fbbf24', // amber-400
    pptxAccent: '#fbbf24',
    pptxCard: '#0f172a', // slate-900
    pptxCardBorder: '#1e293b', // slate-800
  },
  'startup-pitch': {
    bg: 'bg-neutral-900',
    text: 'text-neutral-100',
    title: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-sans font-extrabold tracking-tight',
    body: 'text-neutral-300',
    accent: '#34d399', // emerald-400
    accentClass: 'text-emerald-400',
    card: 'bg-neutral-800/50 border-neutral-700/50 shadow-2xl',
    border: 'border-neutral-800',
    fontFamily: 'font-sans',
    gradientBg: 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-zinc-900',
    pptxBg: '#171717', // neutral-900
    pptxText: '#f5f5f5', // neutral-100
    pptxTitle: '#34d399', // emerald-400
    pptxAccent: '#34d399',
    pptxCard: '#262626', // neutral-800
    pptxCardBorder: '#404040', // neutral-700
  },
  education: {
    bg: 'bg-blue-950',
    text: 'text-cyan-50',
    title: 'text-cyan-300 font-sans font-bold',
    body: 'text-blue-100/90',
    accent: '#06b6d4', // cyan-500
    accentClass: 'text-cyan-300',
    card: 'bg-blue-900/40 border-cyan-800/30 backdrop-blur-sm',
    border: 'border-blue-900',
    fontFamily: 'font-sans',
    pptxBg: '#172554', // blue-950
    pptxText: '#ecfeff', // cyan-50
    pptxTitle: '#67e8f9', // cyan-300
    pptxAccent: '#06b6d4',
    pptxCard: '#1e3a8a', // blue-900
    pptxCardBorder: '#1e40af', // blue-800
  },
  bold: {
    bg: 'bg-indigo-950',
    text: 'text-orange-50',
    title: 'text-orange-400 font-sans font-black tracking-tight',
    body: 'text-indigo-200',
    accent: '#fb923c', // orange-400
    accentClass: 'text-orange-400',
    card: 'bg-indigo-900/40 border-indigo-800/50 backdrop-blur-sm',
    border: 'border-indigo-900',
    fontFamily: 'font-sans',
    pptxBg: '#1e1b4b', // indigo-950
    pptxText: '#fff7ed', // orange-50
    pptxTitle: '#fb923c', // orange-400
    pptxAccent: '#fb923c',
    pptxCard: '#312e81', // indigo-900
    pptxCardBorder: '#4338ca', // indigo-800
  },
}

export function getTheme(styleName?: string | null): PresentationTheme {
  if (!styleName) return THEMES.professional
  const norm = styleName.toLowerCase()
  return THEMES[norm] || THEMES.professional
}
