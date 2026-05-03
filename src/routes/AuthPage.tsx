import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LiftlogLogo } from '../components/brand/LiftlogLogo'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../features/auth/useAuth'
import { supabase } from '../lib/supabaseClient'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    const action =
      mode === 'sign-in'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })

    const { error: authError } = await action
    setIsSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === 'sign-up') {
      setMessage(
        'Account created. Check your email if confirmation is required, then sign in.',
      )
      setMode('sign-in')
      setPassword('')
      return
    }

    navigate(from ?? '/')
  }

  if (session) {
    return (
      <section className="lift-page flex min-h-[50dvh] w-full flex-col items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-md flex-col items-center space-y-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <LiftlogLogo className="h-14 w-14 sm:h-16 sm:w-16" />
            <p className="text-sm font-bold tracking-tight text-[var(--lift-text)]">Liftlog</p>
          </div>
          <PageHeader
            align="center"
            description="You are already signed in. Head home to log training and trends."
            title="Welcome back"
          />
          <Link className="lift-btn-primary w-full max-w-xs" to="/">
            Go to home
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="lift-page flex min-h-[min(72dvh,calc(100dvh-10rem))] w-full flex-col items-center justify-center px-4 py-10 sm:py-14">
      <div className="flex w-full max-w-md flex-col items-center space-y-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <LiftlogLogo className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" />
          <div>
            <p className="text-lg font-bold tracking-tight text-[var(--lift-text)]">Liftlog</p>
            <p className="text-xs font-medium text-[var(--lift-text-muted)]">training log</p>
          </div>
        </div>

        <PageHeader
          align="center"
          description={
            mode === 'sign-in'
              ? 'Sign in with the email and password you used to create your account.'
              : 'Create an account to save workouts, weigh-ins, and steps to the cloud.'
          }
          title={mode === 'sign-in' ? 'Sign in' : 'Create account'}
        />

        <form
          className="lift-card w-full max-w-md space-y-5 !p-6 text-left sm:!p-7"
          onSubmit={onSubmit}
        >
          <label className="block">
            <span className="lift-label">Email</span>
            <input
              autoComplete="email"
              autoCapitalize="none"
              className="lift-input min-h-12"
              inputMode="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="lift-label">Password</span>
            <input
              autoComplete={
                mode === 'sign-in' ? 'current-password' : 'new-password'
              }
              className="lift-input min-h-12"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <ErrorAlert message={error} /> : null}
          {message ? (
            <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-[var(--lift-text)]">
              {message}
            </p>
          ) : null}

          <button
            className="lift-btn-primary min-h-12 w-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? 'Working…'
              : mode === 'sign-in'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <button
          className="max-w-md min-h-11 w-full rounded-xl px-4 py-3 text-center text-sm font-medium text-[var(--lift-text-muted)] underline-offset-4 transition hover:bg-[var(--lift-surface-2)] hover:text-[var(--lift-text)] hover:underline active:scale-[0.99]"
          type="button"
          onClick={() =>
            setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'))
          }
        >
          {mode === 'sign-in'
            ? 'Need an account? Create one'
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </section>
  )
}
