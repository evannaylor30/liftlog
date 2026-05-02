import type { ReactNode } from 'react'

type EmptyStateProps = {
  children: ReactNode
}

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="lift-empty rounded-2xl px-5 py-10 text-center text-sm leading-relaxed">
      {children}
    </div>
  )
}
