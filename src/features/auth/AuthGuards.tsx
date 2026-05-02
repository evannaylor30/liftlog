import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from '../../components/ui/LoadingState'
import { useAuth } from './useAuth'

type GuardProps = {
  children: ReactNode
}

export function RequireAuth({ children }: GuardProps) {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <section className="lift-page">
        <LoadingState label="Checking your session…" />
      </section>
    )
  }

  if (!session) {
    return <Navigate replace to="/auth" state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function GuestOnly({ children }: GuardProps) {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <section className="lift-page">
        <LoadingState label="Loading…" />
      </section>
    )
  }

  if (session) {
    return <Navigate replace to="/" />
  }

  return <>{children}</>
}
