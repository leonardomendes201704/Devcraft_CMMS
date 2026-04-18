import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthJobById, updateAuthJob } from '../../shared/api/jobs'
import { listAuthDepartments } from '../../shared/api/departments'
import { PageHeader } from '../../shared/ui/PageHeader'
import { JobForm } from './components/JobForm'
import { extractErrorMessage } from '../users/utils'

export function JobsEditPage() {
  const { jobId = '' } = useParams()
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [values, setValues] = useState({
    departmentId: '',
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  const jobQuery = useQuery({
    queryKey: ['auth-job', jobId],
    queryFn: () => getAuthJobById(jobId),
    enabled: Boolean(jobId),
  })

  const departmentsQuery = useQuery({
    queryKey: ['auth-departments'],
    queryFn: listAuthDepartments,
  })

  useEffect(() => {
    if (!jobQuery.data) {
      return
    }

    setValues({
      departmentId: jobQuery.data.departmentId,
      name: jobQuery.data.name,
      code: jobQuery.data.code,
      description: jobQuery.data.description ?? '',
      isActive: jobQuery.data.isActive,
    })
  }, [jobQuery.data])

  const mutation = useMutation({
    mutationFn: () =>
      updateAuthJob(jobId, {
        departmentId: values.departmentId,
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description.trim() || null,
        isActive: values.isActive,
      }),
    onSuccess: () => {
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['auth-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['auth-job', jobId] })
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const noticeMessage = jobQuery.isError
    ? 'Failed to load job details.'
    : departmentsQuery.isError
      ? 'Failed to load departments catalog.'
      : saveError
        ? saveError
        : mutation.isPending
          ? 'Saving changes...'
          : null

  return (
    <section className="mx-auto max-w-[1000px] text-slate-900">
      <PageHeader
        eyebrow="Access Control"
        eyebrowClassName="text-emerald-700"
        title="Edit Job"
        subtitle="Update job and department linkage."
        actions={
          <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/jobs">
            Back to list
          </Link>
        }
      />

      {noticeMessage ? <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{noticeMessage}</section> : null}

      {jobQuery.data ? (
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
          <h2 className="mb-3 text-lg font-semibold">Update Job</h2>
          <JobForm
            values={values}
            isSubmitting={mutation.isPending}
            submitLabel="Save changes"
            departmentOptions={(departmentsQuery.data ?? []).map((department) => ({ id: department.id, name: department.name }))}
            onChange={setValues}
            onSubmit={() => mutation.mutate()}
          />
        </section>
      ) : null}
    </section>
  )
}
