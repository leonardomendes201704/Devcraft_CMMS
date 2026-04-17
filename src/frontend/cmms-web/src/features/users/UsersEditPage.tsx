import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthUserById, resetAuthUserPassword, updateAuthUser, type AuthRole } from '../../shared/api/users'
import { UserForm } from './components/UserForm'
import { UserSummaryCard } from './components/UserSummaryCard'
import { UsersPageHeader } from './components/UsersPageHeader'
import { extractErrorMessage } from './utils'

export function UsersEditPage() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [values, setValues] = useState({
    email: '',
    password: '',
    role: 'technician' as AuthRole,
    isActive: true,
  })

  const userQuery = useQuery({
    queryKey: ['auth-user', userId],
    queryFn: () => getAuthUserById(userId),
    enabled: Boolean(userId),
  })

  useEffect(() => {
    if (!userQuery.data) {
      return
    }

    setValues({
      email: userQuery.data.email,
      password: '',
      role: userQuery.data.role,
      isActive: userQuery.data.isActive,
    })
  }, [userQuery.data])

  const updateUserMutation = useMutation({
    mutationFn: ({ role, isActive }: { role: AuthRole; isActive: boolean }) => updateAuthUser(userId, { role, isActive }),
    onSuccess: () => {
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['auth-users'] })
      queryClient.invalidateQueries({ queryKey: ['auth-user', userId] })
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (password: string) => resetAuthUserPassword(userId, { password }),
    onSuccess: () => {
      setSaveError(null)
      setResetPassword('')
      queryClient.invalidateQueries({ queryKey: ['auth-user', userId] })
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  function handleSave() {
    setSaveError(null)
    updateUserMutation.mutate({
      role: values.role,
      isActive: values.isActive,
    })
  }

  function handleResetPassword() {
    const password = resetPassword.trim()
    if (!password) {
      return
    }

    setSaveError(null)
    resetPasswordMutation.mutate(password)
  }

  return (
    <section className="mx-auto max-w-[1000px] text-slate-900">
      <UsersPageHeader
        title="Edit User"
        subtitle="Update role/status and reset credentials."
        actions={
          <>
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/users">
              Back to list
            </Link>
            {userId ? (
              <button
                className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
                type="button"
                onClick={() => navigate(`/app/admin/users/${userId}`)}
              >
                View user
              </button>
            ) : null}
          </>
        }
      />

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
        {userQuery.isLoading ? 'Loading user details...' : null}
        {userQuery.isError ? 'Failed to load user details.' : null}
        {saveError ? saveError : null}
        {updateUserMutation.isPending || resetPasswordMutation.isPending ? 'Saving changes...' : null}
      </section>

      {userQuery.data ? (
        <>
          <section className="mb-4 rounded-2xl border border-slate-200 bg-white/90 p-4">
            <h2 className="mb-3 text-lg font-semibold">Update profile</h2>
            <UserForm
              mode="edit"
              values={values}
              isSubmitting={updateUserMutation.isPending}
              disableEmail
              submitLabel="Save changes"
              onChange={setValues}
              onSubmit={handleSave}
            />
          </section>

          <section className="mb-4 rounded-2xl border border-slate-200 bg-white/90 p-4">
            <h2 className="mb-3 text-lg font-semibold">Reset password</h2>
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                type="password"
                aria-label="Reset password"
                placeholder="New password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
              />
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                type="button"
                onClick={handleResetPassword}
              >
                Reset password
              </button>
            </div>
          </section>

          <UserSummaryCard user={userQuery.data} />
        </>
      ) : null}
    </section>
  )
}
