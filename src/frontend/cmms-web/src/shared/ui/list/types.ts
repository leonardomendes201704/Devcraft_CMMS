export type SortDirection = 'asc' | 'desc'

export type ListSortState<TSortKey extends string> = {
  sortKey: TSortKey
  sortDirection: SortDirection
}

