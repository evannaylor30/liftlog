type LoadingStateProps = {
  label: string
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <span
          className="size-5 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-600 dark:border-t-zinc-200"
          aria-hidden
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
      </div>
      <div className="lift-skeleton h-2 max-w-xs rounded-full" />
      <div className="lift-skeleton h-2 max-w-md rounded-full" />
    </div>
  )
}
