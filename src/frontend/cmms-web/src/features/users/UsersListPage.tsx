import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listAuthUsers } from '../../shared/api/users'
import { getRoleLabel } from './constants'
import { UsersPageHeader } from './components/UsersPageHeader'
import { formatLocalTimestamp } from './utils'

export function UsersListPage() {
  const usersQuery = useQuery({
    queryKey: ['auth-users'],
    queryFn: listAuthUsers,
  })

  const users = usersQuery.data ?? []
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email, undefined, { sensitivity: 'base' })),
    [users],
  )

  return (
    <section className="mx-auto max-w-[1400px] text-slate-900">
      <UsersPageHeader
        title="User Administration"
        subtitle="List and manage users through dedicated screens."
        actions={
          <Link className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500" to="/app/admin/users/create">
            Create user
          </Link>
        }
      />

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
        {usersQuery.isLoading ? 'Loading users from API...' : null}
        {usersQuery.isError ? 'Failed to load users. Check API and permissions.' : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
        <h2 className="mb-3 text-lg font-semibold">Users</h2>
        <div className="space-y-3">
          {sortedUsers.map((user) => (
            <article key={user.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{user.id}</p>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                  <p className="text-xs text-slate-600">
                    {getRoleLabel(user.role)} - {user.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-xs text-slate-600">Created: {formatLocalTimestamp(user.createdAtUtc)}</p>
                </div>
                <div className="text-xs text-slate-700">{user.updatedAtUtc ? `Updated: ${formatLocalTimestamp(user.updatedAtUtc)}` : 'Updated: -'}</div>
                <div className="text-xs text-slate-700">Role: {getRoleLabel(user.role)}</div>
                <div className="flex items-center justify-end gap-2">
                  <Link
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    to={`/app/admin/users/${user.id}`}
                  >
                    View
                  </Link>
                  <Link
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    to={`/app/admin/users/${user.id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
