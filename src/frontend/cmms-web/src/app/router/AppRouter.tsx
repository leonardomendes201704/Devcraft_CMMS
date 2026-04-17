import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { KanbanPage } from '../../features/kanban/KanbanPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <KanbanPage />,
  },
  {
    path: '/kanban',
    element: <KanbanPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
