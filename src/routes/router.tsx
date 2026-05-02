import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { GuestOnly, RequireAuth } from '../features/auth/AuthGuards'
import { AuthPage } from './AuthPage'
import { BodyweightPage } from './BodyweightPage'
import { DashboardPage } from './DashboardPage'
import { NotFoundPage } from './NotFoundPage'
import { StepsPage } from './StepsPage'
import { WorkoutsPage } from './WorkoutsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'workouts',
        element: (
          <RequireAuth>
            <WorkoutsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'bodyweight',
        element: (
          <RequireAuth>
            <BodyweightPage />
          </RequireAuth>
        ),
      },
      {
        path: 'steps',
        element: (
          <RequireAuth>
            <StepsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'auth',
        element: (
          <GuestOnly>
            <AuthPage />
          </GuestOnly>
        ),
      },
    ],
    errorElement: <NotFoundPage />,
  },
])
