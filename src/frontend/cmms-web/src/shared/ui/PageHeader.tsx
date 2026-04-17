import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
  aside?: ReactNode
  eyebrowClassName?: string
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  aside,
  eyebrowClassName = 'text-sky-700',
  className,
}: PageHeaderProps) {
  const rootClassName = ['mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/70 backdrop-blur', className]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={rootClassName}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className={`text-xs uppercase tracking-[0.2em] ${eyebrowClassName}`}>{eyebrow}</p> : null}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        {aside ? <div>{aside}</div> : null}
      </div>
    </header>
  )
}
