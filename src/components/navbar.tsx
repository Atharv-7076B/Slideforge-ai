import { authClient } from '#/lib/auth-client'
import { Link, useRouter, useLocation } from '@tanstack/react-router'
import { LogOut, Moon, Presentation, Sun, User, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function Navbar() {
  const router = useRouter()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()
  const [theme, setTheme] = useState<Theme>('dark')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isAuthPage) return

    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const handleThemeChange = () => {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      setTheme(current)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('theme-change', handleThemeChange)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('theme-change', handleThemeChange)
    }
  }, [isAuthPage])

  if (isAuthPage) return null

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.dispatchEvent(new Event('theme-change'))
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.navigate({ to: '/' })
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-white/80 dark:bg-[#050506]/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/80 shadow-sm' 
          : 'py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="size-9 rounded-xl bg-[#f97316] flex items-center justify-center shadow-lg shadow-[#f97316]/10 transition-transform group-hover:scale-[1.03]">
            <Presentation className="size-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-zinc-900 dark:text-white tracking-tight">
            SlideForge<span className="text-[#f97316]">.ai</span>
          </span>
        </Link>

        {/* Navigation Links - Center (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">
            Features
          </a>
          <a href="/#templates" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">
            Templates
          </a>
          <a href="/#pricing" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">
            Pricing
          </a>
          <a href="/#docs" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors">
            Docs
          </a>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl size-9 border border-zinc-200/50 dark:border-zinc-800/40 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="size-4.5" />
            ) : (
              <Moon className="size-4.5" />
            )}
          </Button>

          {/* User menu */}
          {isPending ? (
            <div className="size-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-9 rounded-full p-0 border border-zinc-200/50 dark:border-zinc-850"
                >
                  <Avatar className="size-9 border-2 border-[#f97316]/25">
                    <AvatarImage
                      src={session.user.image ?? ''}
                      alt={session.user.name || 'User'}
                    />
                    <AvatarFallback className="bg-[#f97316]/10 text-[#f97316] font-medium">
                      {session.user.name ? (
                        session.user.name.charAt(0).toUpperCase()
                      ) : (
                        <User className="size-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 shadow-xl"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{session.user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] font-medium">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-medium px-4 transition-colors">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-xl size-9 border border-zinc-200/50 dark:border-zinc-800/40 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="size-4.5" />
            ) : (
              <Menu className="size-4.5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-b border-zinc-200/60 dark:border-zinc-800/80 bg-white/95 dark:bg-[#050506]/95 backdrop-blur-md px-6 py-6 space-y-6 flex flex-col items-stretch"
          >
            <div className="flex flex-col gap-4">
              <a 
                href="/#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors py-1"
              >
                Features
              </a>
              <a 
                href="/#templates" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors py-1"
              >
                Templates
              </a>
              <a 
                href="/#pricing" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors py-1"
              >
                Pricing
              </a>
              <a 
                href="/#docs" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors py-1"
              >
                Docs
              </a>
            </div>

            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800/80 w-full" />

            {isPending ? (
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />
            ) : session?.user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-1">
                  <Avatar className="size-9 border-2 border-[#f97316]/25">
                    <AvatarImage src={session.user.image ?? ''} alt={session.user.name || 'User'} />
                    <AvatarFallback className="bg-[#f97316]/10 text-[#f97316] font-medium">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">{session.user.name}</span>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[200px]">{session.user.email}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-red-500/20 hover:border-red-500/40 text-red-500 hover:bg-red-500/5 w-full h-10"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button asChild variant="ghost" className="rounded-xl h-10 text-zinc-650 dark:text-zinc-300 hover:text-[#f97316] dark:hover:text-[#f97316] font-medium justify-center">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild className="rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-medium h-10 transition-colors justify-center">
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

