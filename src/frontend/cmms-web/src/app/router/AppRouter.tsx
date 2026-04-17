import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { LoginPage } from '../../features/auth/LoginPage'
import { HomePage } from '../../features/home/HomePage'
import { KanbanPage } from '../../features/kanban/KanbanPage'
import { UsersCreatePage } from '../../features/users/UsersCreatePage'
import { UsersEditPage } from '../../features/users/UsersEditPage'
import { UsersListPage } from '../../features/users/UsersListPage'
import { UsersViewPage } from '../../features/users/UsersViewPage'
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
                element: <UsersListPage />,
              },
              {
                path: 'admin/users/create',
                element: <UsersCreatePage />,
              },
              {
                path: 'admin/users/:userId',
                element: <UsersViewPage />,
              },
              {
                path: 'admin/users/:userId/edit',
                element: <UsersEditPage />,
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
