import type { ReactNode } from 'react'

type ListSectionProps = {
  title?: string
  children: ReactNode
  className?: string
}

export function ListSection({ title, children, className }: ListSectionProps) {
  const rootClassName = ['rounded-2xl border border-slate-200 bg-white/90 p-4', className].filter(Boolean).join(' ')

  return (
    <section className={rootClassName}>
      {title ? <h2 className="mb-3 text-lg font-semibold">{title}</h2> : null}
      {children}
    </section>
  )
}

