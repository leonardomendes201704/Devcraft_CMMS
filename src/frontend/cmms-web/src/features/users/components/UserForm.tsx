import type { FormEvent } from 'react'
import type { AuthRole } from '../../../shared/api/users'
import { roleOptions } from '../constants'

type UserFormValues = {
  email: string
  password: string
  role: AuthRole
  isActive: boolean
}

type UserFormProps = {
  mode: 'create' | 'edit'
  values: UserFormValues
  isSubmitting: boolean
  disableEmail?: boolean
  submitLabel: string
  onChange: (next: UserFormValues) => void
  onSubmit: () => void
}

export function UserForm({ mode, values, isSubmitting, disableEmail, submitLabel, onChange, onSubmit }: UserFormProps) {
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
