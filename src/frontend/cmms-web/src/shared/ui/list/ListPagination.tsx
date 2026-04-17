type ListPaginationProps = {
  totalItems: number
  currentPage: number
  pageSize: number
  onPageChange: (nextPage: number) => void
  onPageSizeChange?: (nextPageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function ListPagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  className,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const summaryStart = totalItems === 0 ? 0 : pageStart + 1
  const summaryEnd = Math.min(pageEnd, totalItems)

  const rootClassName = ['mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700', className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName}>
      <p>
        Showing {summaryStart}-{summaryEnd} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 ? (
          <select
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        ) : null}
        <button
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Next
        </button>
      </div>
    </div>
  )
}
