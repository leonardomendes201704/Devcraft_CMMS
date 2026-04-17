import type { ReactNode } from 'react'
import { getSessionUser } from '../../../shared/auth/session'

type UsersPageHeaderProps = {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function UsersPageHeader({ title, subtitle, actions }: UsersPageHeaderProps) {
  const sessionUser = getSessionUser()

  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/70 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Access Control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">
            Signed in as <span className="font-medium">{sessionUser?.email ?? 'unknown user'}</span> ({sessionUser?.role ?? '-'})
          </p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
