import type { KanbanTask, TaskEvidence, TaskStatus, TaskType } from '../../features/kanban/types'
import { apiFetch } from './http'

type ApiTaskEvidence = {
  id: string
  title: string
  kind?: 'image' | 'api'
  imageUrl: string
  payloadJson?: string | null
  source: string
  capturedAtUtc: string
}

type ApiKanbanTask = {
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
  evidences: ApiTaskEvidence[]
}

type CreateTaskPayload = {
  title: string
  description: string
  type: TaskType
  module: string
  assignee?: string
  estimateHours: number
}

type AddTaskEvidencePayload = {
  title: string
  kind?: 'image' | 'api'
  imageUrl?: string
  payloadJson?: string
  source?: string
  capturedAtUtc?: string
}

export async function listTasks() {
  const tasks = await apiFetch<ApiKanbanTask[]>('/api/tasks')
  return tasks.map(toKanbanTask)
}

export async function createTask(payload: CreateTaskPayload) {
  const task = await apiFetch<ApiKanbanTask>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return toKanbanTask(task)
}

export async function updateTaskStatus(taskId: string, status: Exclude<TaskStatus, 'closed'>) {
  const task = await apiFetch<ApiKanbanTask>(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  return toKanbanTask(task)
}

export async function updateTaskEffort(taskId: string, spentHours: number) {
  const task = await apiFetch<ApiKanbanTask>(`/api/tasks/${taskId}/effort`, {
    method: 'PATCH',
    body: JSON.stringify({ spentHours }),
  })

  return toKanbanTask(task)
}

export async function completeTask(taskId: string) {
  const task = await apiFetch<ApiKanbanTask>(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
    body: JSON.stringify({}),
  })

  return toKanbanTask(task)
}

export async function addTaskEvidence(taskId: string, payload: AddTaskEvidencePayload) {
  const task = await apiFetch<ApiKanbanTask>(`/api/tasks/${taskId}/evidences`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return toKanbanTask(task)
}

function toKanbanTask(task: ApiKanbanTask): KanbanTask {
  return {
    ...task,
    description: task.description ?? '',
    assignee: task.assignee ?? 'Unassigned',
    closedAtUtc: task.closedAtUtc ?? null,
    totalSpentHoursOnClose: task.totalSpentHoursOnClose ?? null,
    totalLeadTimeHoursOnClose: task.totalLeadTimeHoursOnClose ?? null,
    evidences: (task.evidences ?? []).map(toTaskEvidence),
  }
}

function toTaskEvidence(evidence: ApiTaskEvidence): TaskEvidence {
  const hasPayload = typeof evidence.payloadJson === 'string' && evidence.payloadJson.trim().length > 0
  const kind = evidence.kind === 'api' || hasPayload ? 'api' : 'image'
  return {
    id: evidence.id,
    title: evidence.title ?? 'Evidence',
    kind,
    imageUrl: evidence.imageUrl ?? '',
    payloadJson: evidence.payloadJson ?? null,
    source: evidence.source ?? 'manual',
    capturedAtUtc: evidence.capturedAtUtc,
  }
}
