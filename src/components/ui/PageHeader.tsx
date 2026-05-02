import { cn } from '../../lib/cn'

type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  /** Use on auth and other focused screens. */
  align?: 'start' | 'center'
}

export function PageHeader({
  title,
  description,
  eyebrow,
  align = 'start',
}: PageHeaderProps) {
  const centered = align === 'center'

  return (
    <header className={cn('space-y-2', centered && 'text-center')}>
      {eyebrow ? (
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-wider text-[var(--lift-text-muted)]',
            centered && 'mx-auto max-w-lg',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1 className={cn('lift-title', centered && 'mx-auto max-w-lg')}>{title}</h1>
      {description ? (
        <p
          className={cn(
            'max-w-xl text-sm leading-relaxed text-[var(--lift-text-muted)]',
            centered && 'mx-auto max-w-md',
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}
