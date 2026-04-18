import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { AuthUser } from '../../shared/api/users'
import { listAuthUsers } from '../../shared/api/users'
import { useListState } from '../../shared/hooks/useListState'
import { PageHeader } from '../../shared/ui/PageHeader'
import { DataGrid, ListPagination, ListSection, ListToolbar } from '../../shared/ui/list'
import type { DataGridColumn, SortDirection } from '../../shared/ui/list'
import { getRoleLabel, roleOptions } from './constants'
import { formatLocalTimestamp } from './utils'

const pageSizeOptions = [5, 10, 20, 50]
type SortKey = 'name' | 'email' | 'role' | 'status' | 'job' | 'createdAt' | 'updatedAt'
type StatusFilter = 'all' | 'active' | 'inactive'

function getUserInitials(nameOrEmail: string) {
  const normalized = nameOrEmail.trim()
  if (!normalized) {
    return 'US'
  }

  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return normalized.slice(0, 2).toUpperCase()
}

function getDisplayName(user: AuthUser) {
  return user.profile?.fullName ?? user.email
}

function getRoleSortValue(user: AuthUser) {
  return getRoleLabel(user.role)
}

function getStatusSortValue(user: AuthUser) {
  return user.isActive ? 'active' : 'inactive'
}

function getJobSortValue(user: AuthUser) {
  return `${user.profile?.jobName ?? user.profile?.jobTitle ?? ''} ${user.profile?.departmentName ?? user.profile?.department ?? ''}`.trim()
}

function getSortableDateValue(value?: string | null) {
  if (!value) {
    return 0
  }

  return new Date(value).getTime()
}

function getSortValue(user: AuthUser, sortKey: SortKey) {
  switch (sortKey) {
    case 'name':
      return getDisplayName(user)
    case 'email':
      return user.email
    case 'role':
      return getRoleSortValue(user)
    case 'status':
      return getStatusSortValue(user)
    case 'job':
      return getJobSortValue(user)
    case 'createdAt':
      return getSortableDateValue(user.createdAtUtc)
    case 'updatedAt':
      return getSortableDateValue(user.updatedAtUtc)
    default:
      return ''
  }
}

function sortUsers(users: AuthUser[], sortKey: SortKey, sortDirection: SortDirection) {
  const directionFactor = sortDirection === 'asc' ? 1 : -1

  return [...users].sort((a, b) => {
    const left = getSortValue(a, sortKey)
    const right = getSortValue(b, sortKey)

    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * directionFactor
    }

    const leftString = String(left).toLowerCase()
    const rightString = String(right).toLowerCase()
    return leftString.localeCompare(rightString, undefined, { sensitivity: 'base' }) * directionFactor
  })
}

export function UsersListPage() {
  const {
    search,
    filters,
    pageSize,
    currentPage,
    sortKey,
    sortDirection,
    sortState,
    setSearch,
    setFilter,
    setPageSize,
    setPage,
    toggleSort,
  } = useListState<SortKey, { role: string; status: StatusFilter }>({
    initialSearch: '',
    initialFilters: { role: 'all', status: 'all' },
    initialSortKey: 'name',
    initialSortDirection: 'asc',
    initialPageSize: 10,
  })

  const usersQuery = useQuery({
    queryKey: ['auth-users'],
    queryFn: listAuthUsers,
  })
  const noticeMessage = usersQuery.isError
    ? 'Failed to load users. Check API and permissions.'
    : null
  const hasNoticeMessage = Boolean(noticeMessage?.trim())

  const users = usersQuery.data ?? []

  const filteredUsers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    const result = users.filter((user) => {
      const profileFields = [
        user.profile?.fullName,
        user.profile?.displayName,
        user.profile?.jobName,
        user.profile?.departmentName,
        user.profile?.jobTitle,
        user.profile?.department,
        user.profile?.employeeCode,
        user.profile?.phoneE164,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        searchTerm.length === 0 ||
        user.email.toLowerCase().includes(searchTerm) ||
        profileFields.includes(searchTerm)

      const matchesRole = filters.role === 'all' || user.role === filters.role
      const matchesStatus =
        filters.status === 'all' || (filters.status === 'active' ? user.isActive : !user.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })

    return sortUsers(result, sortKey, sortDirection)
  }, [filters.role, filters.status, search, sortDirection, sortKey, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedUsers = filteredUsers.slice(pageStart, pageEnd)

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages)
    }
  }, [currentPage, setPage, totalPages])

  const columns = useMemo<Array<DataGridColumn<AuthUser, SortKey>>>(
    () => [
      {
        key: 'name',
        label: 'User',
        sortable: true,
        sortKey: 'name',
        renderCell: (user) => (
          <div className="flex items-center gap-3">
            {user.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt={`Avatar of ${user.profile?.fullName ?? user.email}`}
                className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-sky-100 text-[11px] font-semibold text-sky-700">
                {getUserInitials(getDisplayName(user))}
              </div>
            )}
            <span className="font-medium text-slate-900">{getDisplayName(user)}</span>
          </div>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
        sortKey: 'email',
        renderCell: (user) => <span className="text-slate-700">{user.email}</span>,
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        sortKey: 'role',
        renderCell: (user) => <span className="text-slate-700">{getRoleLabel(user.role)}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        sortKey: 'status',
        renderCell: (user) => <span className="text-slate-700">{user.isActive ? 'Active' : 'Inactive'}</span>,
      },
      {
        key: 'job',
        label: 'Job/Dept',
        sortable: true,
        sortKey: 'job',
        renderCell: (user) => (
          <span className="text-slate-700">
            {user.profile?.jobName ?? user.profile?.jobTitle ?? '-'} / {user.profile?.departmentName ?? user.profile?.department ?? '-'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        sortKey: 'createdAt',
        renderCell: (user) => <span className="text-slate-700">{formatLocalTimestamp(user.createdAtUtc)}</span>,
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        sortable: true,
        sortKey: 'updatedAt',
        renderCell: (user) => (
          <span className="text-slate-700">{user.updatedAtUtc ? formatLocalTimestamp(user.updatedAtUtc) : '-'}</span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        renderCell: (user) => (
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
        ),
      },
    ],
    [],
  )

  return (
    <section className="mx-auto max-w-[1400px] text-slate-900">
      <PageHeader
        eyebrow="Access Control"
        eyebrowClassName="text-emerald-700"
        title="Users"
        subtitle="List and manage users through dedicated screens."
        actions={
          <Link className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500" to="/app/admin/users/create">
            Create user
          </Link>
        }
      />

      {hasNoticeMessage ? (
        <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          {noticeMessage}
        </section>
      ) : null}

      <ListSection title="Users">
        <ListToolbar>
          <input
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            type="search"
            placeholder="Search by email, name, job, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            value={filters.role}
            onChange={(event) => setFilter('role', event.target.value)}
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
            value={filters.status}
            onChange={(event) => setFilter('status', event.target.value as StatusFilter)}
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
        </ListToolbar>

        <DataGrid<AuthUser, SortKey>
          columns={columns}
          rows={paginatedUsers}
          rowKey={(user) => user.id}
          sortState={sortState}
          onSort={toggleSort}
          emptyMessage="No users found for current filters."
        />

        <ListPagination totalItems={filteredUsers.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setPage} />
      </ListSection>
    </section>
  )
}
