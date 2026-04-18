import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAuthDepartmentById } from '../../shared/api/departments'
import { PageHeader } from '../../shared/ui/PageHeader'
import { formatLocalTimestamp } from '../users/utils'

export function DepartmentsViewPage() {
  const { departmentId = '' } = useParams()
  const query = useQuery({
    queryKey: ['auth-department', departmentId],
    queryFn: () => getAuthDepartmentById(departmentId),
    enabled: Boolean(departmentId),
  })

  return (
    <section className="mx-auto max-w-[1000px] text-slate-900">
      <PageHeader
        eyebrow="Access Control"
        eyebrowClassName="text-emerald-700"
        title="Department Details"
        subtitle="Read-only department data."
        actions={
          <>
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/departments">
              Back to list
            </Link>
            {departmentId ? (
              <Link className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500" to={`/app/admin/departments/${departmentId}/edit`}>
                Edit department
              </Link>
            ) : null}
          </>
        }
      />

      {query.isError ? <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">Failed to load department details.</section> : null}

      {query.data ? (
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
          <div className="grid gap-2 text-sm text-slate-800 md:grid-cols-2">
            <p>
              <span className="font-medium text-slate-700">ID:</span> {query.data.id}
            </p>
            <p>
              <span className="font-medium text-slate-700">Name:</span> {query.data.name}
            </p>
            <p>
              <span className="font-medium text-slate-700">Code:</span> {query.data.code}
            </p>
            <p>
              <span className="font-medium text-slate-700">Status:</span> {query.data.isActive ? 'Active' : 'Inactive'}
            </p>
            <p className="md:col-span-2">
              <span className="font-medium text-slate-700">Description:</span> {query.data.description ?? '-'}
            </p>
            <p>
              <span className="font-medium text-slate-700">Created (Local):</span> {formatLocalTimestamp(query.data.createdAtUtc)}
            </p>
            <p>
              <span className="font-medium text-slate-700">Updated (Local):</span>{' '}
              {query.data.updatedAtUtc ? formatLocalTimestamp(query.data.updatedAtUtc) : '-'}
            </p>
          </div>
        </section>
      ) : null}
    </section>
  )
}
