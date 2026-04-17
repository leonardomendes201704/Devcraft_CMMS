import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAuthUser,
  listAuthUsers,
  resetAuthUserPassword,
  type AuthRole,
  type AuthUser,
  updateAuthUser,
} from '../../shared/api/users'
import { getSessionUser } from '../../shared/auth/session'

const roleOptions: Array<{ value: AuthRole; label: string }> = [
  { value: 'admin_master', label: 'Admin Master' },
  { value: 'admin', label: 'Admin' },
  { value: 'technician', label: 'Technician' },
]

export function UsersAdminPage() {
  const queryClient = useQueryClient()
  const sessionUser = getSessionUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AuthRole>('technician')
  const [isActive, setIsActive] = useState(true)
  const [resetPasswordByUserId, setResetPasswordByUserId] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  const usersQuery = useQuery({
    queryKey: ['auth-users'],
    queryFn: listAuthUsers,
  })

  const users = usersQuery.data ?? []

  const createUserMutation = useMutation({
    mutationFn: createAuthUser,
    onSuccess: () => {
      setSaveError(null)
      setEmail('')
      setPassword('')
      setRole('technician')
      setIsActive(true)
      queryClient.invalidateQueries({ queryKey: ['auth-users'] })
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: { role?: AuthRole; isActive?: boolean } }) =>
      updateAuthUser(userId, payload),
    onSuccess: () => {
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['auth-users'] })
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      resetAuthUserPassword(userId, { password: newPassword }),
    onSuccess: (_, variables) => {
      setSaveError(null)
      setResetPasswordByUserId((current) => ({ ...current, [variables.userId]: '' }))
      queryClient.invalidateQueries({ queryKey: ['auth-users'] })
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const isSaving = createUserMutation.isPending || updateUserMutation.isPending || resetPasswordMutation.isPending

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email, undefined, { sensitivity: 'base' })),
    [users],
  )

  function handleCreateUser(event: FormEvent) {
    event.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password.trim()) {
      return
    }

    setSaveError(null)
    createUserMutation.mutate({
      email: trimmedEmail,
      password,
      role,
      isActive,
    })
  }

  function handleRoleChange(user: AuthUser, nextRole: AuthRole) {
    if (user.role === nextRole) {
      return
    }

    setSaveError(null)
    updateUserMutation.mutate({
      userId: user.id,
      payload: { role: nextRole },
    })
  }

  function handleActiveChange(user: AuthUser, nextActive: boolean) {
    if (user.isActive === nextActive) {
      return
    }

    setSaveError(null)
    updateUserMutation.mutate({
      userId: user.id,
      payload: { isActive: nextActive },
    })
  }

  function handleResetPassword(userId: string) {
    const newPassword = (resetPasswordByUserId[userId] ?? '').trim()
    if (!newPassword) {
      return
    }

    setSaveError(null)
    resetPasswordMutation.mutate({ userId, newPassword })
  }

  return (
      <section className="mx-auto max-w-[1400px] text-slate-900">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Access Control</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">User Administration</h1>
              <p className="mt-1 text-sm text-slate-600">
                Signed in as <span className="font-medium">{sessionUser?.email ?? 'unknown user'}</span> ({sessionUser?.role ?? '-'})
              </p>
            </div>
          </div>
        </header>

        <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          {usersQuery.isLoading ? 'Loading users from API...' : null}
          {usersQuery.isError ? 'Failed to load users. Check API and permissions.' : null}
          {saveError ? saveError : null}
          {isSaving ? 'Saving changes...' : null}
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-4">
          <h2 className="mb-3 text-lg font-semibold">Create User</h2>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreateUser}>
            <label className="grid gap-1 text-sm">
              <span>Email</span>
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                type="email"
                aria-label="Create email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@cmms.local"
                required
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span>Initial Password</span>
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                type="password"
                aria-label="Create initial password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 chars"
                required
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span>Role</span>
              <select
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                aria-label="Create role"
                value={role}
                onChange={(event) => setRole(event.target.value as AuthRole)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-6 inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
              <span>Active user</span>
            </label>

            <div className="md:col-span-2">
              <button
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                type="submit"
              >
                Create user
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
          <h2 className="mb-3 text-lg font-semibold">Users</h2>

          <div className="space-y-3">
            {sortedUsers.map((user) => (
              <article key={user.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 grid gap-2 md:grid-cols-[2fr_1fr_1fr] md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{user.id}</p>
                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-600">Created: {formatLocalTimestamp(user.createdAtUtc)}</p>
                  </div>

                  <label className="grid gap-1 text-xs">
                    <span className="uppercase tracking-wide text-slate-500">Role</span>
                    <select
                      className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                      aria-label={`User role ${user.email}`}
                      value={user.role}
                      onChange={(event) => handleRoleChange(user, event.target.value as AuthRole)}
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={user.isActive}
                      onChange={(event) => handleActiveChange(user, event.target.checked)}
                    />
                    <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>

                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <input
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    type="password"
                    aria-label={`Reset password ${user.email}`}
                    placeholder="New password"
                    value={resetPasswordByUserId[user.id] ?? ''}
                    onChange={(event) =>
                      setResetPasswordByUserId((current) => ({
                        ...current,
                        [user.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    type="button"
                    onClick={() => handleResetPassword(user.id)}
                  >
                    Reset password
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
  )
}

function formatLocalTimestamp(value: string): string {
  const normalized = /([zZ]|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(date)
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  return 'Operation failed. Please review payload and try again.'
}
