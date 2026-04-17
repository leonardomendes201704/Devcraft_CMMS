import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getApiHealth } from '../../shared/api/health'
import { PageHeader } from '../../shared/ui/PageHeader'

export function HomePage() {
  const { t } = useTranslation()

  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: getApiHealth,
  })

  return (
    <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <PageHeader eyebrow="Operations" title={t('title')} subtitle={t('subtitle')} className="mb-0 shadow-slate-200/60" />

      <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/60">
        <h2 className="text-sm font-semibold text-slate-700">{t('apiStatus')}</h2>
        <p className="mt-2 text-2xl font-semibold text-emerald-700">{healthQuery.data?.status ? t('healthy') : t('unknown')}</p>
        <p className="mt-2 text-xs text-slate-500">{t('tenantHint')}</p>
      </article>
    </section>
  )
}
