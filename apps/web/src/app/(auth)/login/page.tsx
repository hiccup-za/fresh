'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf } from '@phosphor-icons/react'

interface FieldErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return errors
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')

    const errors = validate(email, password)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setLoading(true)
    // Simulate network latency
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)

    router.push('/dashboard')
  }

  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center mb-8">
          <Leaf size={80} weight="fill" color="#22c55e" className="mb-4" />
          <h1 className="text-5xl font-bold text-white tracking-tight">Fresh</h1>
        </div>

        {/* Card */}
        <div data-testid="login-container" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Form-level error */}
            {formError && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[#1a0a0a] border border-[#3a1a1a] text-sm text-[#ef4444]">
                <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {formError}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#ccc] mb-1.5">
                Email
              </label>
              <input
                data-testid="login-email"
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); clearFieldError('email') }}
                placeholder="you@example.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className={[
                  'w-full px-3 py-2 rounded-lg bg-[#111] border text-sm text-white placeholder-[#444]',
                  'focus:outline-none focus:ring-2 transition-colors',
                  fieldErrors.email
                    ? 'border-[#ef4444] focus:ring-[#ef4444]/30'
                    : 'border-[#1a1a1a] focus:ring-[#22c55e]/30 focus:border-[#22c55e]/60',
                ].join(' ')}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-[#ef4444]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#ccc] mb-1.5">
                Password
              </label>
              <input
                data-testid="login-password"
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); clearFieldError('password') }}
                placeholder="••••••••"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className={[
                  'w-full px-3 py-2 rounded-lg bg-[#111] border text-sm text-white placeholder-[#444]',
                  'focus:outline-none focus:ring-2 transition-colors',
                  fieldErrors.password
                    ? 'border-[#ef4444] focus:ring-[#ef4444]/30'
                    : 'border-[#1a1a1a] focus:ring-[#22c55e]/30 focus:border-[#22c55e]/60',
                ].join(' ')}
              />
              {fieldErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-[#ef4444]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              data-testid="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 rounded-lg bg-white text-black text-sm font-medium transition-colors hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
