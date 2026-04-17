import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getApiHealth } from '../../shared/api/health'

export function HomePage() {
  const { i18n, t } = useTranslation()
  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: getApiHealth,
  })

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/40">
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="mt-2 text-slate-300">{t('subtitle')}</p>
        </header>

        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">{t('apiStatus')}</h2>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
              {healthQuery.data?.status ? t('healthy') : t('unknown')}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300">{t('tenantHint')}</p>
        </article>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">{t('language')}:</span>
          <button
            className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
            onClick={() => i18n.changeLanguage('pt-BR')}
            type="button"
          >
            pt-BR
          </button>
          <button
            className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
            onClick={() => i18n.changeLanguage('en-US')}
            type="button"
          >
            en-US
          </button>
        </div>
      </section>
    </main>
  )
}
