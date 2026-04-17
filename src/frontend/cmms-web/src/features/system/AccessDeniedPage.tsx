import { Link } from 'react-router-dom'

export function AccessDeniedPage() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-900 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Authorization</p>
      <h1 className="mt-2 text-2xl font-semibold">Access denied</h1>
      <p className="mt-2 text-sm text-slate-700">
        Your current role does not have permission to access this module.
      </p>
      <Link
        to="/app/home"
        className="mt-4 inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Back to home
      </Link>
    </section>
  )
}
