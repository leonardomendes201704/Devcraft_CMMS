import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listAuthUsers } from '../../shared/api/users'
import { getRoleLabel, roleOptions } from './constants'
import { UsersPageHeader } from './components/UsersPageHeader'
import { formatLocalTimestamp } from './utils'

const pageSizeOptions = [5, 10, 20, 50]

export function UsersListPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const usersQuery = useQuery({
    queryKey: ['auth-users'],
    queryFn: listAuthUsers,
  })

  const users = usersQuery.data ?? []
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email, undefined, { sensitivity: 'base' })),
    [users],
  )

  const filteredUsers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return sortedUsers.filter((user) => {
      const matchesSearch =
        searchTerm.length === 0 ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.id.toLowerCase().includes(searchTerm)

      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [roleFilter, search, sortedUsers, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedUsers = filteredUsers.slice(pageStart, pageEnd)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter, statusFilter, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

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

        <div className="mb-4 grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
          <input
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            type="search"
            placeholder="Search by email or id..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">All roles</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {paginatedUsers.map((user) => (
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
          {paginatedUsers.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No users found for current filters.
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
          <p>
            Showing {filteredUsers.length === 0 ? 0 : pageStart + 1}-{Math.min(pageEnd, filteredUsers.length)} of {filteredUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </section>
  )
}
