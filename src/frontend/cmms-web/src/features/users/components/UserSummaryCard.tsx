import type { AuthUser } from '../../../shared/api/users'
import { getRoleLabel } from '../constants'
import { formatLocalTimestamp } from '../utils'

type UserSummaryCardProps = {
  user: AuthUser
}

export function UserSummaryCard({ user }: UserSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
      <div className="grid gap-2 text-sm text-slate-800 md:grid-cols-2">
        <p>
          <span className="font-medium text-slate-700">ID:</span> {user.id}
        </p>
        <p>
          <span className="font-medium text-slate-700">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-medium text-slate-700">Role:</span> {getRoleLabel(user.role)}
        </p>
        <p>
          <span className="font-medium text-slate-700">Status:</span> {user.isActive ? 'Active' : 'Inactive'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Created (Local):</span> {formatLocalTimestamp(user.createdAtUtc)}
        </p>
        <p>
          <span className="font-medium text-slate-700">Updated (Local):</span>{' '}
          {user.updatedAtUtc ? formatLocalTimestamp(user.updatedAtUtc) : '-'}
        </p>
      </div>
    </section>
  )
}
