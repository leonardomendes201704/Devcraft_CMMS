import type { ReactNode } from 'react'
import { SortIcon } from './SortIcon'
import type { ListSortState } from './types'

type ColumnAlign = 'left' | 'center' | 'right'

export type DataGridColumn<TItem, TSortKey extends string> = {
  key: string
  label: string
  sortable?: boolean
  sortKey?: TSortKey
  align?: ColumnAlign
  headerClassName?: string
  cellClassName?: string
  renderHeader?: (context: { column: DataGridColumn<TItem, TSortKey>; isActive: boolean; sortDirection: 'asc' | 'desc' | null }) => ReactNode
  renderCell: (item: TItem) => ReactNode
}

type DataGridProps<TItem, TSortKey extends string> = {
  columns: Array<DataGridColumn<TItem, TSortKey>>
  rows: TItem[]
  rowKey: (item: TItem) => string
  sortState?: ListSortState<TSortKey>
  onSort?: (sortKey: TSortKey) => void
  emptyMessage?: string
  rowClassName?: string
}

export function DataGrid<TItem, TSortKey extends string>({
  columns,
  rows,
  rowKey,
  sortState,
  onSort,
  emptyMessage = 'No records found.',
  rowClassName = 'cursor-default border-t border-slate-200 align-middle hover:bg-slate-50',
}: DataGridProps<TItem, TSortKey>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            {columns.map((column) => {
              const isSortable = Boolean(column.sortable && column.sortKey && onSort && sortState)
              const isActive = Boolean(isSortable && sortState?.sortKey === column.sortKey)
              const sortDirection = isActive ? sortState?.sortDirection ?? null : null
              const headerAlignClass = getHeaderAlignClass(column.align)
              const headerClassName = ['px-3 py-2', headerAlignClass, column.headerClassName].filter(Boolean).join(' ')

              return (
                <th key={column.key} className={headerClassName}>
                  {column.renderHeader ? (
                    column.renderHeader({ column, isActive, sortDirection })
                  ) : isSortable ? (
                    <button
                      className="inline-flex cursor-pointer items-center gap-1 font-semibold hover:text-slate-900"
                      type="button"
                      onClick={() => {
                        if (column.sortKey && onSort) {
                          onSort(column.sortKey)
                        }
                      }}
                    >
                      {column.label} <span aria-hidden="true"><SortIcon direction={sortDirection} /></span>
                    </button>
                  ) : (
                    <span className="font-semibold text-slate-700">{column.label}</span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row) => (
            <tr key={rowKey(row)} className={rowClassName}>
              {columns.map((column) => {
                const cellAlignClass = getCellAlignClass(column.align)
                const cellClassName = ['px-3 py-3 align-middle', cellAlignClass, column.cellClassName].filter(Boolean).join(' ')
                return (
                  <td key={`${rowKey(row)}-${column.key}`} className={cellClassName}>
                    {column.renderCell(row)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="border-t border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">{emptyMessage}</p> : null}
    </div>
  )
}

function getHeaderAlignClass(align: ColumnAlign | undefined): string {
  if (align === 'right') {
    return 'text-right'
  }

  if (align === 'center') {
    return 'text-center'
  }

  return 'text-left'
}

function getCellAlignClass(align: ColumnAlign | undefined): string {
  if (align === 'right') {
    return 'text-right'
  }

  if (align === 'center') {
    return 'text-center'
  }

  return 'text-left'
}
