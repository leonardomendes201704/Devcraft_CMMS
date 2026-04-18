import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthDepartmentById, updateAuthDepartment } from '../../shared/api/departments'
import { PageHeader } from '../../shared/ui/PageHeader'
import { DepartmentForm } from './components/DepartmentForm'
import { extractErrorMessage } from '../users/utils'

export function DepartmentsEditPage() {
  const { departmentId = '' } = useParams()
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [values, setValues] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  const query = useQuery({
    queryKey: ['auth-department', departmentId],
    queryFn: () => getAuthDepartmentById(departmentId),
    enabled: Boolean(departmentId),
  })

  useEffect(() => {
    if (!query.data) {
      return
    }

    setValues({
      name: query.data.name,
      code: query.data.code,
      description: query.data.description ?? '',
      isActive: query.data.isActive,
    })
  }, [query.data])

  const mutation = useMutation({
    mutationFn: () =>
      updateAuthDepartment(departmentId, {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description.trim() || null,
        isActive: values.isActive,
      }),
    onSuccess: () => {
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['auth-departments'] })
      queryClient.invalidateQueries({ queryKey: ['auth-department', departmentId] })
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const noticeMessage = query.isError ? 'Failed to load department details.' : saveError ? saveError : mutation.isPending ? 'Saving changes...' : null

  return (
    <section className="mx-auto max-w-[1000px] text-slate-900">
      <PageHeader
        eyebrow="Access Control"
        eyebrowClassName="text-emerald-700"
        title="Edit Department"
        subtitle="Update department identity and status."
        actions={
          <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/departments">
            Back to list
          </Link>
        }
      />

      {noticeMessage ? <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{noticeMessage}</section> : null}

      {query.data ? (
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
          <h2 className="mb-3 text-lg font-semibold">Update Department</h2>
          <DepartmentForm values={values} isSubmitting={mutation.isPending} submitLabel="Save changes" onChange={setValues} onSubmit={() => mutation.mutate()} />
        </section>
      ) : null}
    </section>
  )
}
