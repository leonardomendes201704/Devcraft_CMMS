import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAuthJob } from '../../shared/api/jobs'
import { listAuthDepartments } from '../../shared/api/departments'
import { PageHeader } from '../../shared/ui/PageHeader'
import { JobForm } from './components/JobForm'
import { extractErrorMessage } from '../users/utils'

export function JobsCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [values, setValues] = useState({
    departmentId: '',
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  const departmentsQuery = useQuery({
    queryKey: ['auth-departments'],
    queryFn: listAuthDepartments,
  })

  const mutation = useMutation({
    mutationFn: createAuthJob,
    onSuccess: (created) => {
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['auth-jobs'] })
      navigate(`/app/admin/jobs/${created.id}`)
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const noticeMessage = departmentsQuery.isError
    ? 'Failed to load departments catalog.'
    : saveError
      ? saveError
      : mutation.isPending
        ? 'Saving changes...'
        : null

  function handleSubmit() {
    if (!values.departmentId || !values.name.trim() || !values.code.trim()) {
      return
    }

    setSaveError(null)
    mutation.mutate({
      departmentId: values.departmentId,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description.trim() || null,
      isActive: values.isActive,
    })
  }

  return (
    <section className="mx-auto max-w-[1000px] text-slate-900">
      <PageHeader
        eyebrow="Access Control"
        eyebrowClassName="text-emerald-700"
        title="Create Job"
        subtitle="Register a new job linked to a department."
        actions={
          <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/jobs">
            Back to list
          </Link>
        }
      />

      {noticeMessage ? <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{noticeMessage}</section> : null}

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
        <h2 className="mb-3 text-lg font-semibold">New Job</h2>
        <JobForm
          values={values}
          isSubmitting={mutation.isPending}
          submitLabel="Create job"
          departmentOptions={(departmentsQuery.data ?? []).map((department) => ({ id: department.id, name: department.name }))}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      </section>
    </section>
  )
}
