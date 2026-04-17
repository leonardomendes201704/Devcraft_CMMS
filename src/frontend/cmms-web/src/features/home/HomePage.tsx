import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getApiHealth } from '../../shared/api/health'

export function HomePage() {
  const { t } = useTranslation()

  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: getApiHealth,
  })

  return (
    <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/60">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Operations</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('subtitle')}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/60">
        <h2 className="text-sm font-semibold text-slate-700">{t('apiStatus')}</h2>
        <p className="mt-2 text-2xl font-semibold text-emerald-700">{healthQuery.data?.status ? t('healthy') : t('unknown')}</p>
        <p className="mt-2 text-xs text-slate-500">{t('tenantHint')}</p>
      </article>
    </section>
  )
}
