import { cn } from '../../lib/cn'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function ymdLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function parseViewMonthYm(viewMonthYm: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(viewMonthYm.trim())
  if (!match) {
    const fallback = new Date()
    return { year: fallback.getFullYear(), month: fallback.getMonth() }
  }
  return { year: Number(match[1]), month: Number(match[2]) - 1 }
}

type BodyweightCalendarProps = {
  /** YYYY-MM-DD — days with any log */
  loggedDates: Set<string>
  /** Calendar month as `YYYY-MM` */
  viewMonthYm: string
  onMonthChange: (delta: number) => void
  selectedYmd: string
  onSelectDay: (ymd: string) => void
  footerHint?: string
  heatmapVariant?: 'violet' | 'emerald'
}

export function BodyweightCalendar({
  loggedDates,
  viewMonthYm,
  onMonthChange,
  selectedYmd,
  onSelectDay,
  footerHint = 'Filled squares are logged days. Tap a day to pick that date.',
  heatmapVariant = 'violet',
}: BodyweightCalendarProps) {
  const { year, month } = parseViewMonthYm(viewMonthYm)
  const base = new Date(year, month, 1)
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(base)

  const firstWeekday = base.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayYmd = ymdLocal(new Date())

  const cells: Array<{ day: number | null; ymd: string | null }> = []
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ day: null, ymd: null })
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const ymd = `${year}-${pad2(month + 1)}-${pad2(d)}`
    cells.push({ day: d, ymd })
  }

  const loggedFill =
    heatmapVariant === 'emerald'
      ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md active:scale-95'
      : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md active:scale-95'

  const todayRing =
    heatmapVariant === 'emerald'
      ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[var(--lift-app-bg)] dark:ring-emerald-400'
      : 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[var(--lift-app-bg)] dark:ring-violet-400'

  const selectedRingOffsetLogged =
    heatmapVariant === 'emerald' ? 'ring-offset-emerald-800' : 'ring-offset-violet-700'

  return (
    <div className="lift-card max-w-none !p-4 sm:!p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          aria-label="Previous month"
          className="lift-btn-secondary min-h-11 min-w-11 px-0 py-0 text-base"
          type="button"
          onClick={() => onMonthChange(-1)}
        >
          ‹
        </button>
        <p className="text-center text-sm font-bold tracking-tight text-[var(--lift-text)]">
          {monthLabel}
        </p>
        <button
          aria-label="Next month"
          className="lift-btn-secondary min-h-11 min-w-11 px-0 py-0 text-base"
          type="button"
          onClick={() => onMonthChange(1)}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={`w-${i}-${wd}`}
            className="pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lift-text-muted)]"
          >
            {wd}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (!cell.ymd || cell.day === null) {
            return (
              <div
                key={`pad-${index}`}
                className="lift-cal-day pointer-events-none opacity-0"
                aria-hidden
              />
            )
          }

          const ymd = cell.ymd
          const dayNum = cell.day
          const logged = loggedDates.has(ymd)
          const isToday = ymd === todayYmd
          const isSelected = ymd === selectedYmd

          return (
            <button
              key={ymd}
              aria-current={isSelected ? 'date' : undefined}
              aria-label={`${ymd}${logged ? ', logged' : ', no entry'}`}
              className={cn(
                'lift-cal-day min-h-11',
                !logged &&
                  'border border-[var(--lift-border-strong)] bg-[var(--lift-surface-2)] text-[var(--lift-text-muted)] active:scale-95',
                logged && loggedFill,
                isToday && todayRing,
                isSelected && 'z-[1] scale-105 ring-2 ring-white/90 ring-offset-2',
                logged && isSelected && selectedRingOffsetLogged,
              )}
              type="button"
              onClick={() => onSelectDay(ymd)}
            >
              {dayNum}
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-center text-[11px] font-medium leading-relaxed text-[var(--lift-text-muted)]">
        {footerHint}
      </p>
    </div>
  )
}
