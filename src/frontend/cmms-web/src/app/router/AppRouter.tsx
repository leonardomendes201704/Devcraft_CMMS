import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { LoginPage } from '../../features/auth/LoginPage'
import { HomePage } from '../../features/home/HomePage'
import { KanbanPage } from '../../features/kanban/KanbanPage'
import { UsersAdminPage } from '../../features/users/UsersAdminPage'
import { AccessDeniedPage } from '../../features/system/AccessDeniedPage'
import { getSessionUser, isAuthenticated } from '../../shared/auth/session'

function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function RequireRole({ roles }: { roles: string[] }) {
  const user = getSessionUser()
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/app/denied" replace />
  }

  return <Outlet />
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Navigate to="/app/home" replace />,
      },
      {
        path: '/app',
        element: <AppShell />,
        children: [
          {
            path: 'home',
            element: <HomePage />,
          },
          {
            path: 'kanban',
            element: <KanbanPage />,
          },
          {
            path: 'denied',
            element: <AccessDeniedPage />,
          },
          {
            element: <RequireRole roles={['admin_master']} />,
            children: [
              {
                path: 'admin/users',
                element: <UsersAdminPage />,
              },
            ],
          },
        ],
      },
      {
        path: '/kanban',
        element: <Navigate to="/app/kanban" replace />,
      },
      {
        path: '/admin/users',
        element: <Navigate to="/app/admin/users" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
