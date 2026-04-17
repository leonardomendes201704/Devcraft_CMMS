import type { AuthRole } from '../../shared/api/users'

export const roleOptions: Array<{ value: AuthRole; label: string }> = [
  { value: 'admin_master', label: 'Admin Master' },
  { value: 'admin', label: 'Admin' },
  { value: 'technician', label: 'Technician' },
]

export function getRoleLabel(role: AuthRole): string {
  return roleOptions.find((option) => option.value === role)?.label ?? role
}
