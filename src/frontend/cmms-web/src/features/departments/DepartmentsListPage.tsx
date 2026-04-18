import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listAuthDepartments, type AuthDepartment } from '../../shared/api/departments'
import { useListState } from '../../shared/hooks/useListState'
import { PageHeader } from '../../shared/ui/PageHeader'
import { DataGrid, ListPagination, ListSection, ListToolbar } from '../../shared/ui/list'
import type { DataGridColumn, SortDirection } from '../../shared/ui/list'
import { formatLocalTimestamp } from '../users/utils'

type SortKey = 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt'
type StatusFilter = 'all' | 'active' | 'inactive'
const pageSizeOptions = [5, 10, 20, 50]

function getSortableDateValue(value?: string | null) {
  return value ? new Date(value).getTime() : 0
}

function getSortValue(item: AuthDepartment, sortKey: SortKey) {
  switch (sortKey) {
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

function sortRows(items: AuthDepartment[], sortKey: SortKey, sortDirection: SortDirection) {
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

export function DepartmentsListPage() {
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
  } = useListState<SortKey, { status: StatusFilter }>({
    initialSearch: '',
    initialFilters: { status: 'all' },
    initialSortKey: 'name',
    initialSortDirection: 'asc',
    initialPageSize: 10,
  })

  const query = useQuery({
    queryKey: ['auth-departments'],
    queryFn: listAuthDepartments,
  })
  const noticeMessage = query.isError ? 'Failed to load departments. Check API and permissions.' : null

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    const result = (query.data ?? []).filter((item) => {
      const matchesSearch =
        term.length === 0 ||
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        (item.description ?? '').toLowerCase().includes(term)

      const matchesStatus = filters.status === 'all' || (filters.status === 'active' ? item.isActive : !item.isActive)
      return matchesSearch && matchesStatus
    })

    return sortRows(result, sortKey, sortDirection)
  }, [filters.status, query.data, search, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRows = filteredRows.slice(pageStart, pageStart + pageSize)

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages)
    }
  }, [currentPage, setPage, totalPages])

  const columns = useMemo<Array<DataGridColumn<AuthDepartment, SortKey>>>(
    () => [
      { key: 'name', label: 'Name', sortable: true, sortKey: 'name', renderCell: (item) => <span className="font-medium text-slate-900">{item.name}</span> },
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
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100" to={`/app/admin/departments/${item.id}`}>
              View
            </Link>
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100" to={`/app/admin/departments/${item.id}/edit`}>
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
        title="Departments"
        subtitle="Manage organizational departments through dedicated screens."
        actions={
          <Link className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500" to="/app/admin/departments/create">
            Create department
          </Link>
        }
      />

      {noticeMessage ? <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{noticeMessage}</section> : null}

      <ListSection title="Departments">
        <ListToolbar>
          <input
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            type="search"
            placeholder="Search by name, code, description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
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

        <DataGrid<AuthDepartment, SortKey>
          columns={columns}
          rows={paginatedRows}
          rowKey={(item) => item.id}
          sortState={sortState}
          onSort={toggleSort}
          emptyMessage="No departments found for current filters."
        />

        <ListPagination totalItems={filteredRows.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setPage} />
      </ListSection>
    </section>
  )
}
