import type { FormEvent } from 'react'

export type JobFormValues = {
  departmentId: string
  name: string
  code: string
  description: string
  isActive: boolean
}

type JobFormProps = {
  values: JobFormValues
  isSubmitting: boolean
  submitLabel: string
  departmentOptions: Array<{ id: string; name: string }>
  onChange: (next: JobFormValues) => void
  onSubmit: () => void
}

export function JobForm({ values, isSubmitting, submitLabel, departmentOptions, onChange, onSubmit }: JobFormProps) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-1 text-sm">
        <span>Department</span>
        <select
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          aria-label="Job department"
          value={values.departmentId}
          onChange={(event) => onChange({ ...values, departmentId: event.target.value })}
          required
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
        <span>Name</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="Job name"
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
          placeholder="Maintenance Technician"
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Code</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm uppercase"
          type="text"
          aria-label="Job code"
          value={values.code}
          onChange={(event) => onChange({ ...values, code: event.target.value.toUpperCase() })}
          placeholder="TECH_MAINT"
          required
        />
      </label>

      <label className="grid gap-1 text-sm md:col-span-2">
        <span>Description</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          aria-label="Job description"
          value={values.description}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
          placeholder="Executes preventive and corrective maintenance."
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.isActive} onChange={(event) => onChange({ ...values, isActive: event.target.checked })} />
        <span>Active job</span>
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
