import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthUserById, resetAuthUserPassword, updateAuthUser } from '../../shared/api/users'
import { PageHeader } from '../../shared/ui/PageHeader'
import { UserForm, type UserFormValues } from './components/UserForm'
import { extractErrorMessage } from './utils'

const defaultValues: UserFormValues = {
  email: '',
  password: '',
  role: 'technician',
  isActive: true,
  fullName: '',
  displayName: '',
  phoneE164: '',
  jobTitle: '',
  department: '',
  employeeCode: '',
  timeZone: 'America/Sao_Paulo',
  locale: 'pt-BR',
  avatarUrl: '',
  emergencyContactName: '',
  emergencyContactPhoneE164: '',
  birthDate: '',
  hireDate: '',
  metadataJson: '{}',
}

export function UsersEditPage() {
  const { userId = '' } = useParams()
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [values, setValues] = useState<UserFormValues>(defaultValues)

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
      ...defaultValues,
      email: userQuery.data.email,
      password: '',
      role: userQuery.data.role,
      isActive: userQuery.data.isActive,
      fullName: userQuery.data.profile?.fullName ?? '',
      displayName: userQuery.data.profile?.displayName ?? '',
      phoneE164: userQuery.data.profile?.phoneE164 ?? '',
      jobTitle: userQuery.data.profile?.jobTitle ?? '',
      department: userQuery.data.profile?.department ?? '',
      employeeCode: userQuery.data.profile?.employeeCode ?? '',
      timeZone: userQuery.data.profile?.timeZone ?? defaultValues.timeZone,
      locale: userQuery.data.profile?.locale ?? defaultValues.locale,
      avatarUrl: userQuery.data.profile?.avatarUrl ?? '',
      emergencyContactName: userQuery.data.profile?.emergencyContactName ?? '',
      emergencyContactPhoneE164: userQuery.data.profile?.emergencyContactPhoneE164 ?? '',
      birthDate: userQuery.data.profile?.birthDate?.slice(0, 10) ?? '',
      hireDate: userQuery.data.profile?.hireDate?.slice(0, 10) ?? '',
      metadataJson: userQuery.data.profile?.metadataJson ?? '{}',
    })
  }, [userQuery.data])

  const updateUserMutation = useMutation({
    mutationFn: (nextValues: UserFormValues) =>
      updateAuthUser(userId, {
        role: nextValues.role,
        isActive: nextValues.isActive,
        profile: {
          fullName: nextValues.fullName.trim(),
          displayName: nextValues.displayName.trim() || null,
          phoneE164: nextValues.phoneE164.trim() || null,
          jobTitle: nextValues.jobTitle.trim() || null,
          department: nextValues.department.trim() || null,
          employeeCode: nextValues.employeeCode.trim() || null,
          timeZone: nextValues.timeZone.trim() || null,
          locale: nextValues.locale.trim() || null,
          avatarUrl: nextValues.avatarUrl.trim() || null,
          emergencyContactName: nextValues.emergencyContactName.trim() || null,
          emergencyContactPhoneE164: nextValues.emergencyContactPhoneE164.trim() || null,
          birthDate: nextValues.birthDate || null,
          hireDate: nextValues.hireDate || null,
          metadataJson: nextValues.metadataJson.trim() || '{}',
        },
      }),
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
  const noticeMessage = userQuery.isError
    ? 'Failed to load user details.'
    : saveError
      ? saveError
      : updateUserMutation.isPending || resetPasswordMutation.isPending
        ? 'Saving changes...'
        : null
  const hasNoticeMessage = Boolean(noticeMessage?.trim())

  function handleSave() {
    if (!values.fullName.trim()) {
      setSaveError('Full name is required.')
      return
    }

    setSaveError(null)
    updateUserMutation.mutate(values)
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
      <PageHeader
        eyebrow="Access Control"
        eyebrowClassName="text-emerald-700"
        title="Edit User"
        subtitle="Update role/status and reset credentials."
        actions={
          <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/users">
            Back to list
          </Link>
        }
      />

      {hasNoticeMessage ? (
        <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          {noticeMessage}
        </section>
      ) : null}

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

        </>
      ) : null}
    </section>
  )
}
