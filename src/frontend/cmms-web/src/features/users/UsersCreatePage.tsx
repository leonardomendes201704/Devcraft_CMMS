import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAuthUser, type AuthRole } from '../../shared/api/users'
import { UserForm } from './components/UserForm'
import { UsersPageHeader } from './components/UsersPageHeader'
import { extractErrorMessage } from './utils'

export function UsersCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [values, setValues] = useState({
    email: '',
    password: '',
    role: 'technician' as AuthRole,
    isActive: true,
  })

  const createUserMutation = useMutation({
    mutationFn: createAuthUser,
    onSuccess: (created) => {
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['auth-users'] })
      navigate(`/app/admin/users/${created.id}`)
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  function handleSubmit() {
    const email = values.email.trim().toLowerCase()
    if (!email || !values.password.trim()) {
      return
    }

    setSaveError(null)
    createUserMutation.mutate({
      email,
      password: values.password,
      role: values.role,
      isActive: values.isActive,
    })
  }

  return (
    <section className="mx-auto max-w-[1000px] text-slate-900">
      <UsersPageHeader
        title="Create User"
        subtitle="Register a new account with role and access status."
        actions={
          <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/users">
            Back to list
          </Link>
        }
      />

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
        {saveError ? saveError : null}
        {createUserMutation.isPending ? 'Saving changes...' : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
        <h2 className="mb-3 text-lg font-semibold">New User</h2>
        <UserForm
          mode="create"
          values={values}
          isSubmitting={createUserMutation.isPending}
          submitLabel="Create user"
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      </section>
    </section>
  )
}
