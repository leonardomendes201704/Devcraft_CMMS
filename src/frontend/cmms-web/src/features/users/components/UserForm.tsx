import type { FormEvent } from 'react'
import type { AuthRole } from '../../../shared/api/users'
import { roleOptions } from '../constants'

export type UserFormValues = {
  email: string
  password: string
  role: AuthRole
  isActive: boolean
  fullName: string
  displayName: string
  phoneE164: string
  departmentId: string
  jobId: string
  jobTitle: string
  department: string
  employeeCode: string
  timeZone: string
  locale: string
  avatarUrl: string
  emergencyContactName: string
  emergencyContactPhoneE164: string
  birthDate: string
  hireDate: string
  metadataJson: string
}

type UserFormProps = {
  mode: 'create' | 'edit'
  values: UserFormValues
  isSubmitting: boolean
  disableEmail?: boolean
  submitLabel: string
  departmentOptions: Array<{ id: string; name: string }>
  jobOptions: Array<{ id: string; name: string; departmentId: string }>
  onChange: (next: UserFormValues) => void
  onSubmit: () => void
}

export function UserForm({
  mode,
  values,
  isSubmitting,
  disableEmail,
  submitLabel,
  departmentOptions,
  jobOptions,
  onChange,
  onSubmit,
}: UserFormProps) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-1 text-sm">
        <span>Email</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="email"
          aria-label="User email"
          value={values.email}
          onChange={(event) => onChange({ ...values, email: event.target.value })}
          placeholder="user@cmms.local"
          required
          disabled={disableEmail}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>{mode === 'create' ? 'Initial Password' : 'New Password (optional)'}</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="password"
          aria-label="User password"
          value={values.password}
          onChange={(event) => onChange({ ...values, password: event.target.value })}
          placeholder={mode === 'create' ? 'Minimum 8 chars' : 'Leave empty to keep current password'}
          required={mode === 'create'}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Full name</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User full name"
          value={values.fullName}
          onChange={(event) => onChange({ ...values, fullName: event.target.value })}
          placeholder="Nome completo"
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Display name</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User display name"
          value={values.displayName}
          onChange={(event) => onChange({ ...values, displayName: event.target.value })}
          placeholder="Nome de exibicao"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Role</span>
        <select
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          aria-label="User role"
          value={values.role}
          onChange={(event) => onChange({ ...values, role: event.target.value as AuthRole })}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-6 inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(event) => onChange({ ...values, isActive: event.target.checked })}
        />
        <span>Active user</span>
      </label>

      <label className="grid gap-1 text-sm">
        <span>Phone (E.164)</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User phone"
          value={values.phoneE164}
          onChange={(event) => onChange({ ...values, phoneE164: event.target.value })}
          placeholder="+5511999999999"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Department</span>
        <select
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          aria-label="User department"
          value={values.departmentId}
          onChange={(event) => {
            const nextDepartmentId = event.target.value
            const currentJob = jobOptions.find((option) => option.id === values.jobId)
            const nextJobId = currentJob && currentJob.departmentId === nextDepartmentId ? values.jobId : ''
            onChange({ ...values, departmentId: nextDepartmentId, jobId: nextJobId })
          }}
        >
          <option value="">Select department</option>
          {departmentOptions.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm">
        <span>Job</span>
        <select
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          aria-label="User job"
          value={values.jobId}
          onChange={(event) => onChange({ ...values, jobId: event.target.value })}
        >
          <option value="">Select job</option>
          {jobOptions
            .filter((job) => !values.departmentId || job.departmentId === values.departmentId)
            .map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm">
        <span>Legacy job title (optional)</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User legacy job title"
          value={values.jobTitle}
          onChange={(event) => onChange({ ...values, jobTitle: event.target.value })}
          placeholder="Fallback free text"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Legacy department (optional)</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User legacy department"
          value={values.department}
          onChange={(event) => onChange({ ...values, department: event.target.value })}
          placeholder="Fallback free text"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Employee code</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User employee code"
          value={values.employeeCode}
          onChange={(event) => onChange({ ...values, employeeCode: event.target.value })}
          placeholder="EMP-001"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Time zone</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User timezone"
          value={values.timeZone}
          onChange={(event) => onChange({ ...values, timeZone: event.target.value })}
          placeholder="America/Sao_Paulo"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Locale</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User locale"
          value={values.locale}
          onChange={(event) => onChange({ ...values, locale: event.target.value })}
          placeholder="pt-BR"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Avatar URL</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="url"
          aria-label="User avatar url"
          value={values.avatarUrl}
          onChange={(event) => onChange({ ...values, avatarUrl: event.target.value })}
          placeholder="https://..."
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Emergency contact</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User emergency contact name"
          value={values.emergencyContactName}
          onChange={(event) => onChange({ ...values, emergencyContactName: event.target.value })}
          placeholder="Nome do contato"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Emergency phone (E.164)</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="User emergency contact phone"
          value={values.emergencyContactPhoneE164}
          onChange={(event) => onChange({ ...values, emergencyContactPhoneE164: event.target.value })}
          placeholder="+5511888888888"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Birth date</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="date"
          aria-label="User birth date"
          value={values.birthDate}
          onChange={(event) => onChange({ ...values, birthDate: event.target.value })}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Hire date</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="date"
          aria-label="User hire date"
          value={values.hireDate}
          onChange={(event) => onChange({ ...values, hireDate: event.target.value })}
        />
      </label>

      <label className="grid gap-1 text-sm md:col-span-2">
        <span>Metadata JSON</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          aria-label="User metadata json"
          value={values.metadataJson}
          onChange={(event) => onChange({ ...values, metadataJson: event.target.value })}
          placeholder='{"skills":["vibration"]}'
        />
      </label>

      <div className="md:col-span-2">
        <button
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
