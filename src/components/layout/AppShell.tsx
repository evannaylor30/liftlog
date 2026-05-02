import { Link, NavLink, Outlet } from 'react-router-dom'
import { LiftlogLogo } from '../brand/LiftlogLogo'
import { useAuth } from '../../features/auth/useAuth'
import { MobileNav } from './MobileNav'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/workouts', label: 'Train' },
  { to: '/bodyweight', label: 'Weight' },
  { to: '/steps', label: 'Steps' },
]

export function AppShell() {
  const { session, signOut, isLoading } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--lift-app-bg)] text-[var(--lift-text)] antialiased">
      <header className="lift-shell-header pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
        <div className="mx-auto flex max-w-lg flex-col gap-3 px-4 py-3 sm:max-w-5xl sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              className="group flex items-center gap-2.5 rounded-xl pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lift-accent)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lift-app-bg)]"
              to="/"
            >
              <LiftlogLogo className="h-9 w-9 sm:h-10 sm:w-10" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-tight text-[var(--lift-text)] sm:text-base">
                  Liftlog
                </span>
                <span className="text-[11px] font-medium text-[var(--lift-text-muted)]">
                  training log
                </span>
              </span>
            </Link>
          </div>

          <nav
            aria-label="Main navigation"
            className="hidden flex-wrap items-center gap-1 md:flex md:flex-1 md:justify-center"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? 'lift-nav-active' : 'lift-nav'
                }
                end={item.end}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:justify-end">
            {isLoading ? (
              <span className="text-xs font-medium text-[var(--lift-text-muted)]">
                Loading…
              </span>
            ) : session ? (
              <>
                <span
                  className="max-w-[9rem] truncate text-[11px] font-medium text-[var(--lift-text-muted)] sm:max-w-[14rem]"
                  title={session.user.email ?? undefined}
                >
                  {session.user.email}
                </span>
                <button
                  className="lift-btn-secondary px-3 py-2 text-xs"
                  type="button"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link className="lift-btn-primary px-3 py-2 text-xs" to="/auth">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5 sm:max-w-5xl sm:px-6 sm:pb-10 sm:pt-8 md:pb-10">
        <Outlet />
      </main>

      <footer className="mb-24 flex flex-col items-center justify-center gap-2 border-t border-[var(--lift-border)] px-4 py-4 text-center md:mb-0 md:flex-row md:gap-3 md:py-4">
        <LiftlogLogo className="h-8 w-8 opacity-90 md:h-9 md:w-9" />
        <p className="text-[11px] font-medium leading-snug text-[var(--lift-text-muted)]">
          <span className="font-semibold text-[var(--lift-text)]">Liftlog</span>
          {' — '}
          training log
        </p>
      </footer>

      <MobileNav />
    </div>
  )
}
