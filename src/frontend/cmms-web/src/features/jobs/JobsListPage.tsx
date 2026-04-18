import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listAuthJobs, type AuthJob } from '../../shared/api/jobs'
import { listAuthDepartments } from '../../shared/api/departments'
import { useListState } from '../../shared/hooks/useListState'
import { PageHeader } from '../../shared/ui/PageHeader'
import { DataGrid, ListPagination, ListSection, ListToolbar } from '../../shared/ui/list'
import type { DataGridColumn, SortDirection } from '../../shared/ui/list'
import { formatLocalTimestamp } from '../users/utils'

type SortKey = 'department' | 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt'
type StatusFilter = 'all' | 'active' | 'inactive'
const pageSizeOptions = [5, 10, 20, 50]

function getSortableDateValue(value?: string | null) {
  return value ? new Date(value).getTime() : 0
}

function getSortValue(item: AuthJob, sortKey: SortKey) {
  switch (sortKey) {
    case 'department':
      return item.departmentName
    case 'name':
      return item.name
    case 'code':
      return item.code
    case 'status':
      return item.isActive ? 'active' : 'inactive'
    case 'createdAt':
      return getSortableDateValue(item.createdAtUtc)
    case 'updatedAt':
      return getSortableDateValue(item.updatedAtUtc)
    default:
      return ''
  }
}

function sortRows(items: AuthJob[], sortKey: SortKey, sortDirection: SortDirection) {
  const factor = sortDirection === 'asc' ? 1 : -1
  return [...items].sort((left, right) => {
    const leftValue = getSortValue(left, sortKey)
    const rightValue = getSortValue(right, sortKey)

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * factor
    }

    return String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: 'base' }) * factor
  })
}

export function JobsListPage() {
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
  } = useListState<SortKey, { status: StatusFilter; departmentId: string }>({
    initialSearch: '',
    initialFilters: { status: 'all', departmentId: 'all' },
    initialSortKey: 'department',
    initialSortDirection: 'asc',
    initialPageSize: 10,
  })

  const jobsQuery = useQuery({
    queryKey: ['auth-jobs'],
    queryFn: () => listAuthJobs(),
  })
  const departmentsQuery = useQuery({
    queryKey: ['auth-departments'],
    queryFn: listAuthDepartments,
  })
  const noticeMessage = jobsQuery.isError ? 'Failed to load jobs. Check API and permissions.' : departmentsQuery.isError ? 'Failed to load departments catalog.' : null

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    const result = (jobsQuery.data ?? []).filter((item) => {
      const matchesSearch =
        term.length === 0 ||
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.departmentName.toLowerCase().includes(term) ||
        (item.description ?? '').toLowerCase().includes(term)

      const matchesStatus = filters.status === 'all' || (filters.status === 'active' ? item.isActive : !item.isActive)
      const matchesDepartment = filters.departmentId === 'all' || item.departmentId === filters.departmentId
      return matchesSearch && matchesStatus && matchesDepartment
    })

    return sortRows(result, sortKey, sortDirection)
  }, [filters.departmentId, filters.status, jobsQuery.data, search, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRows = filteredRows.slice(pageStart, pageStart + pageSize)

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages)
    }
  }, [currentPage, setPage, totalPages])

  const columns = useMemo<Array<DataGridColumn<AuthJob, SortKey>>>(
    () => [
      { key: 'department', label: 'Department', sortable: true, sortKey: 'department', renderCell: (item) => <span className="font-medium text-slate-900">{item.departmentName}</span> },
      { key: 'name', label: 'Job', sortable: true, sortKey: 'name', renderCell: (item) => <span className="text-slate-700">{item.name}</span> },
      { key: 'code', label: 'Code', sortable: true, sortKey: 'code', renderCell: (item) => <span className="text-slate-700">{item.code}</span> },
      { key: 'status', label: 'Status', sortable: true, sortKey: 'status', renderCell: (item) => <span className="text-slate-700">{item.isActive ? 'Active' : 'Inactive'}</span> },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        sortKey: 'createdAt',
        renderCell: (item) => <span className="text-slate-700">{formatLocalTimestamp(item.createdAtUtc)}</span>,
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        sortable: true,
        sortKey: 'updatedAt',
        renderCell: (item) => <span className="text-slate-700">{item.updatedAtUtc ? formatLocalTimestamp(item.updatedAtUtc) : '-'}</span>,
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        renderCell: (item) => (
          <div className="flex items-center justify-end gap-2">
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100" to={`/app/admin/jobs/${item.id}`}>
              View
            </Link>
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100" to={`/app/admin/jobs/${item.id}/edit`}>
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
        title="Jobs"
        subtitle="Manage job titles linked to departments."
        actions={
          <Link className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500" to="/app/admin/jobs/create">
            Create job
          </Link>
        }
      />

      {noticeMessage ? <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{noticeMessage}</section> : null}

      <ListSection title="Jobs">
        <ListToolbar>
          <input
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            type="search"
            placeholder="Search by name, code, department..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            value={filters.departmentId}
            onChange={(event) => setFilter('departmentId', event.target.value)}
          >
            <option value="all">All departments</option>
            {(departmentsQuery.data ?? []).map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
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
          <select className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        </ListToolbar>

        <DataGrid<AuthJob, SortKey>
          columns={columns}
          rows={paginatedRows}
          rowKey={(item) => item.id}
          sortState={sortState}
          onSort={toggleSort}
          emptyMessage="No jobs found for current filters."
        />

        <ListPagination totalItems={filteredRows.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setPage} />
      </ListSection>
    </section>
  )
}
