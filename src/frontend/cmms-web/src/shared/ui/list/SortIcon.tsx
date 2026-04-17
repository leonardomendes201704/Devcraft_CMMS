import type { SortDirection } from './types'

type SortIconProps = {
  direction: SortDirection | null
}

export function SortIcon({ direction }: SortIconProps) {
  if (direction === 'asc') {
    return (
      <svg className="h-3.5 w-3.5 text-sky-600" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3l4 5H4L8 3z" fill="currentColor" />
      </svg>
    )
  }

  if (direction === 'desc') {
    return (
      <svg className="h-3.5 w-3.5 text-sky-600" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 13l-4-5h8l-4 5z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3l2.5 3H5.5L8 3zM8 13l-2.5-3h5L8 13z" fill="currentColor" />
    </svg>
  )
}

