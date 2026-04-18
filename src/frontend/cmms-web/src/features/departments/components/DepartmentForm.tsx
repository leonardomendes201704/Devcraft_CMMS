import type { FormEvent } from 'react'

export type DepartmentFormValues = {
  name: string
  code: string
  description: string
  isActive: boolean
}

type DepartmentFormProps = {
  values: DepartmentFormValues
  isSubmitting: boolean
  submitLabel: string
  onChange: (next: DepartmentFormValues) => void
  onSubmit: () => void
}

export function DepartmentForm({ values, isSubmitting, submitLabel, onChange, onSubmit }: DepartmentFormProps) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-1 text-sm">
        <span>Name</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          type="text"
          aria-label="Department name"
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
          placeholder="Maintenance"
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Code</span>
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm uppercase"
          type="text"
          aria-label="Department code"
          value={values.code}
          onChange={(event) => onChange({ ...values, code: event.target.value.toUpperCase() })}
          placeholder="MAINT"
          required
        />
      </label>

      <label className="grid gap-1 text-sm md:col-span-2">
        <span>Description</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          aria-label="Department description"
          value={values.description}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
          placeholder="Maintenance operations and planning."
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.isActive} onChange={(event) => onChange({ ...values, isActive: event.target.checked })} />
        <span>Active department</span>
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
