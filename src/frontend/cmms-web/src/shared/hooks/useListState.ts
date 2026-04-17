import { useCallback, useMemo, useState } from 'react'
import type { ListSortState, SortDirection } from '../ui/list'

type UseListStateOptions<TSortKey extends string, TFilters extends Record<string, unknown>> = {
  initialSearch?: string
  initialFilters: TFilters
  initialSortKey: TSortKey
  initialSortDirection?: SortDirection
  initialPageSize: number
}

type UseListStateResult<TSortKey extends string, TFilters extends Record<string, unknown>> = {
  search: string
  filters: TFilters
  pageSize: number
  currentPage: number
  sortKey: TSortKey
  sortDirection: SortDirection
  sortState: ListSortState<TSortKey>
  setSearch: (value: string) => void
  setFilter: <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => void
  setPageSize: (value: number) => void
  setPage: (value: number) => void
  toggleSort: (nextKey: TSortKey) => void
}

export function useListState<TSortKey extends string, TFilters extends Record<string, unknown>>(
  options: UseListStateOptions<TSortKey, TFilters>,
): UseListStateResult<TSortKey, TFilters> {
  const [search, setSearchState] = useState(options.initialSearch ?? '')
  const [filters, setFilters] = useState<TFilters>(options.initialFilters)
  const [pageSize, setPageSizeState] = useState(options.initialPageSize)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<TSortKey>(options.initialSortKey)
  const [sortDirection, setSortDirection] = useState<SortDirection>(options.initialSortDirection ?? 'asc')

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
    setCurrentPage(1)
  }, [])

  const setFilter = useCallback(<TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
    setCurrentPage(1)
  }, [])

  const setPageSize = useCallback((value: number) => {
    setPageSizeState(value)
    setCurrentPage(1)
  }, [])

  const setPage = useCallback((value: number) => {
    setCurrentPage(Math.max(1, value))
  }, [])

  const toggleSort = useCallback((nextKey: TSortKey) => {
    setCurrentPage(1)
    setSortKey((currentSortKey) => {
      if (currentSortKey === nextKey) {
        setSortDirection((currentSortDirection) => (currentSortDirection === 'asc' ? 'desc' : 'asc'))
        return currentSortKey
      }

      setSortDirection('asc')
      return nextKey
    })
  }, [])

  const sortState = useMemo<ListSortState<TSortKey>>(
    () => ({
      sortKey,
      sortDirection,
    }),
    [sortDirection, sortKey],
  )

  return {
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
  }
}

