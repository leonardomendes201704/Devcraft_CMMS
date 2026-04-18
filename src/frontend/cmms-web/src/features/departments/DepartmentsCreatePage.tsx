import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAuthDepartment } from '../../shared/api/departments'
import { PageHeader } from '../../shared/ui/PageHeader'
import { DepartmentForm } from './components/DepartmentForm'
import { extractErrorMessage } from '../users/utils'

export function DepartmentsCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [values, setValues] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  const mutation = useMutation({
    mutationFn: createAuthDepartment,
    onSuccess: (created) => {
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['auth-departments'] })
      navigate(`/app/admin/departments/${created.id}`)
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const noticeMessage = saveError ? saveError : mutation.isPending ? 'Saving changes...' : null

  function handleSubmit() {
    if (!values.name.trim() || !values.code.trim()) {
      return
    }

    setSaveError(null)
    mutation.mutate({
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
        title="Create Department"
        subtitle="Register a new organizational department."
        actions={
          <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/departments">
            Back to list
          </Link>
        }
      />

      {noticeMessage ? <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{noticeMessage}</section> : null}

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
        <h2 className="mb-3 text-lg font-semibold">New Department</h2>
        <DepartmentForm values={values} isSubmitting={mutation.isPending} submitLabel="Create department" onChange={setValues} onSubmit={handleSubmit} />
      </section>
    </section>
  )
}
