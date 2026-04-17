export type TaskStatus = 'new' | 'active' | 'resolved' | 'closed'

export type TaskType = 'feature' | 'bug' | 'chore' | 'hardening' | 'doc' | 'test' | 'devops'

export interface KanbanTask {
  id: string
  title: string
  description: string
  type: TaskType
  module: string
  assignee: string
  estimateHours: number
  spentHours: number
  status: TaskStatus
  createdAtUtc: string
  closedAtUtc: string | null
  totalSpentHoursOnClose: number | null
  totalLeadTimeHoursOnClose: number | null
  evidences: TaskEvidence[]
}

export interface TaskEvidence {
  id: string
  title: string
  kind: 'image' | 'api'
  imageUrl: string
  payloadJson: string | null
  source: string
  capturedAtUtc: string
}

export const taskStatusOrder: TaskStatus[] = ['new', 'active', 'resolved', 'closed']

export const taskStatusLabel: Record<TaskStatus, string> = {
  new: 'New',
  active: 'Active',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const taskTypeLabel: Record<TaskType, string> = {
  feature: 'Feature',
  bug: 'Bug',
  chore: 'Chore',
  hardening: 'Hardening',
  doc: 'Documentation',
  test: 'Test',
  devops: 'DevOps',
}
