import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

const tabs = [
  { to: '/', label: 'Home', end: true, icon: IconHome },
  { to: '/workouts', label: 'Train', end: false, icon: IconTrain },
  { to: '/bodyweight', label: 'Weight', end: false, icon: IconScale },
  { to: '/steps', label: 'Steps', end: false, icon: IconSteps },
] as const

function IconHome({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn('size-6', active && 'drop-shadow-sm')}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" />
    </svg>
  )
}

function IconTrain({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn('size-6', active && 'drop-shadow-sm')}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M6 5h12v3H6V5Zm-2 5h4v8H4v-8Zm14 0h4v8h-4v-8Z"
        strokeLinejoin="round"
      />
      <path d="M8 10h8" strokeLinecap="round" />
    </svg>
  )
}

function IconScale({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn('size-6', active && 'drop-shadow-sm')}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M12 3a7 7 0 0 0-7 7v4h14v-4a7 7 0 0 0-7-7Z" />
      <path d="M5 17h14v3H5v-3Z" strokeLinecap="round" />
    </svg>
  )
}

function IconSteps({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn('size-6', active && 'drop-shadow-sm')}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M4 16h4l2-8 2 10 2-6h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MobileNav() {
  return (
    <nav aria-label="Primary" className="lift-mobile-nav md:hidden">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              cn(
                'lift-mobile-nav-item min-h-14 text-current',
                isActive && 'lift-mobile-nav-item-active',
              )
            }
            end={end}
            to={to}
          >
            {({ isActive }) => (
              <>
                <span className="text-current">
                  <Icon active={isActive} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
