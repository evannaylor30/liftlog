import { cn } from '../../lib/cn'

type LiftlogLogoProps = {
  className?: string
}

/** Raster mark from `public/liftlog-logo.png` (replace file to rebrand). */
export function LiftlogLogo({ className }: LiftlogLogoProps) {
  return (
    <img
      alt=""
      aria-hidden
      className={cn(
        'pointer-events-none shrink-0 select-none rounded-2xl object-cover shadow-sm',
        className ?? 'h-9 w-9 sm:h-10 sm:w-10',
      )}
      decoding="async"
      src="/liftlog-logo.png"
    />
  )
}
