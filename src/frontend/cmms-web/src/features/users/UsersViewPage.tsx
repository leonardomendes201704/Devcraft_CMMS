import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAuthUserById } from '../../shared/api/users'
import { UserSummaryCard } from './components/UserSummaryCard'
import { UsersPageHeader } from './components/UsersPageHeader'

export function UsersViewPage() {
  const { userId = '' } = useParams()

  const userQuery = useQuery({
    queryKey: ['auth-user', userId],
    queryFn: () => getAuthUserById(userId),
    enabled: Boolean(userId),
  })

  return (
    <section className="mx-auto max-w-[1000px] text-slate-900">
      <UsersPageHeader
        title="User Details"
        subtitle="Read-only user profile details."
        actions={
          <>
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/app/admin/users">
              Back to list
            </Link>
            {userId ? (
              <Link className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500" to={`/app/admin/users/${userId}/edit`}>
                Edit user
              </Link>
            ) : null}
          </>
        }
      />

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
        {userQuery.isLoading ? 'Loading user details...' : null}
        {userQuery.isError ? 'Failed to load user details.' : null}
      </section>

      {userQuery.data ? <UserSummaryCard user={userQuery.data} /> : null}
    </section>
  )
}
