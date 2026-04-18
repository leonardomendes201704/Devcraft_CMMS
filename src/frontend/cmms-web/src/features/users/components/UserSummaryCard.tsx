import type { AuthUser } from '../../../shared/api/users'
import { getRoleLabel } from '../constants'
import { formatLocalTimestamp } from '../utils'

type UserSummaryCardProps = {
  user: AuthUser
}

export function UserSummaryCard({ user }: UserSummaryCardProps) {
  const profile = user.profile

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
        <p>
          <span className="font-medium text-slate-700">Last Login (Local):</span>{' '}
          {user.lastLoginAtUtc ? formatLocalTimestamp(user.lastLoginAtUtc) : '-'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Full Name:</span> {profile?.fullName ?? '-'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Display Name:</span> {profile?.displayName ?? '-'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Phone:</span> {profile?.phoneE164 ?? '-'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Job / Department:</span>{' '}
          {profile?.jobName ?? profile?.jobTitle ?? '-'} / {profile?.departmentName ?? profile?.department ?? '-'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Employee Code:</span> {profile?.employeeCode ?? '-'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Locale / Time Zone:</span> {profile?.locale ?? '-'} / {profile?.timeZone ?? '-'}
        </p>
        <p>
          <span className="font-medium text-slate-700">Emergency Contact:</span> {profile?.emergencyContactName ?? '-'} ({profile?.emergencyContactPhoneE164 ?? '-'})
        </p>
      </div>
    </section>
  )
}
