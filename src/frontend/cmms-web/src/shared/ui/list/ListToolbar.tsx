import type { ReactNode } from 'react'

type ListToolbarProps = {
  children: ReactNode
  className?: string
}

export function ListToolbar({ children, className }: ListToolbarProps) {
  const rootClassName = ['mb-4 grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]', className].filter(Boolean).join(' ')
  return <div className={rootClassName}>{children}</div>
}

