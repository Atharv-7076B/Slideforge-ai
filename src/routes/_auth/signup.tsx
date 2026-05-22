import AuthLayout from '#/components/auth/auth-layout'
import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.functions'
import { authClient } from '#/lib/auth-client'
import { toInternalPath } from '#/lib/auth-redirect'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Presentation, Eye, EyeOff } from 'lucide-react'

export const Route = createFileRoute('/_auth/signup')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: SignupPage,
})

function SignupPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState<'credentials' | 'github' | 'google' | null>(null)

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      setIsSubmitting(provider)
      await authClient.signIn.social({
        provider,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Account created successfully')
            setIsSubmitting(null)
            const next = toInternalPath(redirectTo) ?? '/dashboard'
            if (next === '/' || next === '/dashboard' || next.startsWith('/login') || next.startsWith('/signup')) {
              navigate({ to: '/dashboard' })
            } else {
              router.history.push(next)
            }
          },
          onError: ({ error }) => {
            toast.error(error.message || 'Signup failed. Please try again')
            setIsSubmitting(null)
          },
        },
      })
    } catch (error) {
      toast.error('Signup failed. Please try again')
      setIsSubmitting(null)
    }
  }

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {}
    
    if (!name) {
      newErrors.name = 'Full name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCredentialsSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setIsSubmitting('credentials')
      await authClient.signUp.email({
        email,
        password,
        name,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Welcome! Account created successfully.')
            setIsSubmitting(null)
            const next = toInternalPath(redirectTo) ?? '/dashboard'
            if (next === '/' || next === '/dashboard' || next.startsWith('/login') || next.startsWith('/signup')) {
              navigate({ to: '/dashboard' })
            } else {
              router.history.push(next)
            }
          },
          onError: ({ error }) => {
            let errorMsg = 'Failed to create account. Please try again.'
            if (error.message?.toLowerCase().includes('already') || error.code === 'USER_ALREADY_EXISTS') {
              errorMsg = 'An account with this email already exists'
            }
            toast.error(errorMsg)
            setErrors({
              email: errorMsg.includes('exists') || errorMsg.includes('email') ? errorMsg : undefined,
            })
            setIsSubmitting(null)
          },
        },
      })
    } catch (error) {
      toast.error('Failed to create account. Please try again.')
      setIsSubmitting(null)
    }
  }

  return (
    <AuthLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[400px] space-y-6 relative z-10"
      >
        {/* Mobile-only logo */}
        <div className="flex lg:hidden justify-center mb-4">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="size-9 rounded-xl bg-[#f97316] flex items-center justify-center shadow-lg shadow-[#f97316]/10">
              <Presentation className="size-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-zinc-900 dark:text-white tracking-tight">
              SlideForge<span className="text-[#f97316]">.ai</span>
            </span>
          </Link>
        </div>

        {/* Centered clean Auth Card */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-8 sm:p-10 space-y-6 shadow-xl dark:shadow-2xl relative overflow-hidden backdrop-blur-md transition-colors duration-300">
          {/* Subtle glow border at top of card */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#f97316]/20 to-transparent" />
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Create Your Account
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Start generating presentations with AI.
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 text-zinc-750 dark:text-zinc-100 font-semibold flex items-center justify-center gap-2.5 transition-all text-xs disabled:opacity-50 px-3"
              onClick={() => handleSocialLogin('github')}
              disabled={isSubmitting !== null}
            >
              {isSubmitting === 'github' ? (
                <Loader2 className="size-4 animate-spin text-[#f97316]" />
              ) : (
                <svg className="size-4.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              )}
              Continue with GitHub
            </button>

            <button
              type="button"
              className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 text-zinc-750 dark:text-zinc-100 font-semibold flex items-center justify-center gap-2.5 transition-all text-xs disabled:opacity-50 px-3"
              onClick={() => handleSocialLogin('google')}
              disabled={isSubmitting !== null}
            >
              {isSubmitting === 'google' ? (
                <Loader2 className="size-4 animate-spin text-[#f97316]" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 py-1">
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800/80 w-[42%]" />
            <span>or</span>
            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800/80 w-[42%]" />
          </div>

          {/* Credentials Signup Form */}
          <form onSubmit={handleCredentialsSignup} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-zinc-550 dark:text-zinc-400">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                className={`w-full h-10 px-3.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-555 focus:ring-1 transition-all duration-200 outline-none text-sm ${
                  errors.name
                    ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-[#f97316] focus:ring-[#f97316]/30'
                }`}
                disabled={isSubmitting !== null}
              />
              {errors.name && (
                <span className="text-[11px] text-red-500 dark:text-red-400 font-medium block animate-fade-in">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-550 dark:text-zinc-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className={`w-full h-10 px-3.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-555 focus:ring-1 transition-all duration-200 outline-none text-sm ${
                  errors.email
                    ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-[#f97316] focus:ring-[#f97316]/30'
                }`}
                disabled={isSubmitting !== null}
              />
              {errors.email && (
                <span className="text-[11px] text-red-500 dark:text-red-400 font-medium block animate-fade-in">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-555 dark:text-zinc-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  className={`w-full h-10 pl-3.5 pr-10 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-555 focus:ring-1 transition-all duration-200 outline-none text-sm ${
                    errors.password
                      ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-[#f97316] focus:ring-[#f97316]/30'
                  }`}
                  disabled={isSubmitting !== null}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] text-red-500 dark:text-red-400 font-medium block animate-fade-in">
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold shadow-md shadow-[#f97316]/10 flex items-center justify-center gap-2 transition-all text-sm pt-0.5 disabled:opacity-75 cursor-pointer"
              disabled={isSubmitting !== null}
            >
              {isSubmitting === 'credentials' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-900/60 pt-5">
            Save presentations, export decks, and access your workspace.
          </p>
        </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#f97316] hover:text-[#ea580c] hover:underline font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
