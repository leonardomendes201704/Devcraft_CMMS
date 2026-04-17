import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clearAccessToken, getSessionUser } from '../../shared/auth/session'
import type { CSSProperties } from 'react'

type NavIcon = 'home' | 'kanban' | 'users'

type NavItem = {
  labelKey: string
  to: string
  icon: NavIcon
  roles?: string[]
}

const navItems: NavItem[] = [
  { labelKey: 'shell.home', to: '/app/home', icon: 'home' },
  { labelKey: 'shell.kanban', to: '/app/kanban', icon: 'kanban' },
  { labelKey: 'shell.userAdmin', to: '/app/admin/users', icon: 'users', roles: ['admin_master'] },
]

export function AppShell() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const user = getSessionUser()

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) {
        return true
      }

      return Boolean(user && item.roles.includes(user.role))
    })
  }, [user])

  const pageTitle = useMemo(() => {
    const current = navItems.find((item) => location.pathname.startsWith(item.to))
    return current ? t(current.labelKey) : 'CMMS'
  }, [location.pathname, t])

  const userInitial = (user?.email?.trim().charAt(0) || '?').toUpperCase()
  const sidebarWidthPx = isSidebarCollapsed ? 88 : 260
  const shellStyle = { '--sidebar-width': `${sidebarWidthPx}px` } as CSSProperties

  function handleLogout() {
    clearAccessToken()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef3ff_56%,#e8f0ff_100%)] text-slate-900"
      style={shellStyle}
    >
      <div className={`grid h-screen ${isSidebarCollapsed ? 'lg:grid-cols-[88px_1fr]' : 'lg:grid-cols-[260px_1fr]'}`}>
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r border-slate-200 bg-white/95 shadow-xl transition-transform lg:static lg:translate-x-0 lg:shadow-none ${
            isSidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[260px]'
          } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="px-4 pb-4 pt-4">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-700">{t('shell.platform')}</p>
            {!isSidebarCollapsed ? <h1 className="mt-2 text-xl font-semibold">{t('shell.console')}</h1> : null}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={t(item.labelKey)}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-sky-100 text-sky-900' : 'text-slate-700 hover:bg-slate-100'
                  } ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                <MenuIcon icon={item.icon} />
                {!isSidebarCollapsed ? <span className="truncate">{t(item.labelKey)}</span> : null}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 bg-white/95 px-3 py-3">
            <button
              type="button"
              className="hidden w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:flex"
              onClick={() => setIsSidebarCollapsed((value) => !value)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {isSidebarCollapsed ? (
                  <path d="M9 6l6 6-6 6" />
                ) : (
                  <path d="M15 6l-6 6 6 6" />
                )}
              </svg>
              {!isSidebarCollapsed ? <span>{t('shell.collapse')}</span> : null}
            </button>
          </div>
        </aside>

        <div className="flex h-screen flex-col overflow-hidden">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 lg:hidden"
                  type="button"
                  onClick={() => setIsSidebarOpen((open) => !open)}
                >
                  {t('shell.menu')}
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{t('shell.workspace')}</p>
                  <h2 className="text-lg font-semibold text-slate-900">{pageTitle}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={() => i18n.changeLanguage('pt-BR')}
                >
                  pt-BR
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={() => i18n.changeLanguage('en-US')}
                >
                  en-US
                </button>
                <div className="hidden items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 md:flex">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">T</span>
                  <span className="max-w-[240px] truncate">{t('shell.tenant')}: {user?.tenantId ?? '-'}</span>
                </div>
                <div className="hidden items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 md:flex">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">{userInitial}</span>
                  <span className="max-w-[200px] truncate">{user?.email ?? 'unknown@cmms.local'}</span>
                </div>
                <button
                  className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                  type="button"
                  onClick={handleLogout}
                >
                  {t('shell.logout')}
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto h-[calc(100vh-120px)] w-full max-w-[1500px] overflow-y-auto px-4 py-5 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:pl-[var(--sidebar-width)]">
        <div className="flex w-full items-center justify-between gap-2 px-4 py-3 text-xs text-slate-600 sm:px-6">
          <p>{t('shell.footer')}</p>
          <p>{new Date().getFullYear()} Devcraft</p>
        </div>
      </footer>

      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu backdrop"
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
    </div>
  )
}

function MenuIcon({ icon }: { icon: NavIcon }) {
  if (icon === 'home') {
    return (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 10.5l9-7 9 7" />
        <path d="M5 9.5v10h14v-10" />
      </svg>
    )
  }

  if (icon === 'kanban') {
    return (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 8v8M15 8v5" />
      </svg>
    )
  }

  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2" />
      <path d="M4.5 18.5c0-2.8 2.5-4.5 4.5-4.5s4.5 1.7 4.5 4.5" />
      <path d="M14.5 18.5c.2-1.7 1.5-2.8 3-2.8 1.2 0 2.3.7 2.8 1.8" />
    </svg>
  )
}
