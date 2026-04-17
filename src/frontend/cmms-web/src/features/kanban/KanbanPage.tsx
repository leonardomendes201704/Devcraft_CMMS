import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listProjectChangelog } from '../../shared/api/changelog'
import { completeTask, createTask, listTasks, updateTaskEffort, updateTaskStatus } from '../../shared/api/tasks'
import { clearAccessToken } from '../../shared/auth/session'
import { taskStatusLabel, taskStatusOrder, taskTypeLabel, type KanbanTask, type TaskEvidence, type TaskStatus, type TaskType } from './types'

export function KanbanPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const tasksQuery = useQuery({
    queryKey: ['kanban-tasks'],
    queryFn: listTasks,
  })

  const tasks = tasksQuery.data ?? []
  const [search, setSearch] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newType, setNewType] = useState<TaskType>('feature')
  const [newModule, setNewModule] = useState('General')
  const [newEstimate, setNewEstimate] = useState(2)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [lightboxEvidenceId, setLightboxEvidenceId] = useState<string | null>(null)
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [failedEvidenceImages, setFailedEvidenceImages] = useState<Record<string, boolean>>({})

  const changelogQuery = useQuery({
    queryKey: ['project-changelog'],
    queryFn: listProjectChangelog,
    enabled: isChangelogOpen,
  })

  const sortedChangelogReleases = useMemo(() => {
    const releases = changelogQuery.data ?? []
    return [...releases].sort((a, b) => {
      const dateDiff = Date.parse(b.releaseDate) - Date.parse(a.releaseDate)
      if (dateDiff !== 0) {
        return dateDiff
      }

      return b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [changelogQuery.data])

  const refreshTasks = () => queryClient.invalidateQueries({ queryKey: ['kanban-tasks'] })

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      setSaveError(null)
      refreshTasks()
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Exclude<TaskStatus, 'closed'> }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      setSaveError(null)
      refreshTasks()
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const effortMutation = useMutation({
    mutationFn: ({ taskId, spentHours }: { taskId: string; spentHours: number }) => updateTaskEffort(taskId, spentHours),
    onSuccess: () => {
      setSaveError(null)
      refreshTasks()
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const completeMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) => completeTask(taskId),
    onSuccess: () => {
      setSaveError(null)
      refreshTasks()
    },
    onError: (error) => setSaveError(extractErrorMessage(error)),
  })

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return tasks
    }

    return tasks.filter((task) =>
      [task.id, task.title, task.description, task.module, task.assignee, task.type].join(' ').toLowerCase().includes(term),
    )
  }, [search, tasks])

  const totals = useMemo(() => {
    const estimate = tasks.reduce((acc, task) => acc + task.estimateHours, 0)
    const spent = tasks.reduce((acc, task) => acc + task.spentHours, 0)
    const completedSpent = tasks.filter((task) => task.status === 'closed').reduce((acc, task) => acc + task.spentHours, 0)

    return {
      estimate,
      spent,
      completedSpent,
      count: tasks.length,
    }
  }, [tasks])

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) {
      return null
    }

    return tasks.find((task) => task.id === selectedTaskId) ?? null
  }, [selectedTaskId, tasks])

  const orderedTaskEvidences = useMemo(() => {
    if (!selectedTask) {
      return []
    }

    return [...selectedTask.evidences].sort(compareEvidenceForDisplay)
  }, [selectedTask])

  const orderedImageEvidences = useMemo(
    () => orderedTaskEvidences.filter((evidence) => !isApiEvidence(evidence)),
    [orderedTaskEvidences],
  )

  const lightboxIndex = useMemo(() => {
    if (!lightboxEvidenceId) {
      return -1
    }

    return orderedImageEvidences.findIndex((evidence) => evidence.id === lightboxEvidenceId)
  }, [lightboxEvidenceId, orderedImageEvidences])

  const lightboxEvidence = lightboxIndex >= 0 ? orderedImageEvidences[lightboxIndex] : null

  useEffect(() => {
    if (!lightboxEvidence) {
      return
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLightboxEvidenceId(null)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPreviousEvidence()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextEvidence()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [lightboxEvidence, lightboxIndex, orderedImageEvidences])

  useEffect(() => {
    if (!lightboxEvidenceId) {
      return
    }

    const existsInCurrentTask = orderedImageEvidences.some((evidence) => evidence.id === lightboxEvidenceId)
    if (!existsInCurrentTask) {
      setLightboxEvidenceId(null)
    }
  }, [lightboxEvidenceId, orderedImageEvidences])

  function openEvidenceLightbox(evidence: TaskEvidence) {
    setLightboxEvidenceId(evidence.id)
  }

  function goToPreviousEvidence() {
    if (lightboxIndex <= 0) {
      return
    }

    setLightboxEvidenceId(orderedImageEvidences[lightboxIndex - 1].id)
  }

  function goToNextEvidence() {
    if (lightboxIndex < 0 || lightboxIndex >= orderedImageEvidences.length - 1) {
      return
    }

    setLightboxEvidenceId(orderedImageEvidences[lightboxIndex + 1].id)
  }

  function updateTaskStatusById(taskId: string, status: TaskStatus) {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) {
      return
    }

    if (!isAllowedTransition(task.status, status)) {
      return
    }

    setSaveError(null)

    if (status === 'closed') {
      completeMutation.mutate({ taskId })
      return
    }

    statusMutation.mutate({ taskId, status })
  }

  function updateSpentHours(taskId: string, spentHours: number) {
    const normalized = Number.isFinite(spentHours) ? Math.max(0, spentHours) : 0
    setSaveError(null)
    effortMutation.mutate({ taskId, spentHours: normalized })
  }

  function handleCreateTask(event: FormEvent) {
    event.preventDefault()

    const title = newTitle.trim()
    const description = newDescription.trim()
    const moduleName = newModule.trim()
    if (!title || !description || !moduleName) {
      return
    }

    setSaveError(null)

    createTaskMutation.mutate(
      {
        title,
        description,
        type: newType,
        module: moduleName,
        assignee: 'Unassigned',
        estimateHours: Math.max(0.5, newEstimate),
      },
      {
        onSuccess: () => {
          setNewTitle('')
          setNewDescription('')
          setNewEstimate(2)
          setNewType('feature')
          setNewModule('General')
          setIsCreateModalOpen(false)
        },
      },
    )
  }

  function handleLogout() {
    clearAccessToken()
    navigate('/login', { replace: true })
  }

  const isSaving = createTaskMutation.isPending || statusMutation.isPending || effortMutation.isPending || completeMutation.isPending

  const columnStyleByStatus: Record<TaskStatus, { column: string; header: string; card: string; badge: string; input: string }> = {
    new: {
      column: 'border-rose-200 bg-rose-100',
      header: 'bg-rose-200 text-rose-900',
      card: 'border-rose-300 bg-rose-200',
      badge: 'bg-rose-300 text-rose-900',
      input: 'border-rose-300 bg-rose-100',
    },
    active: {
      column: 'border-amber-200 bg-amber-100',
      header: 'bg-amber-200 text-amber-900',
      card: 'border-amber-300 bg-amber-200',
      badge: 'bg-amber-300 text-amber-900',
      input: 'border-amber-300 bg-amber-100',
    },
    resolved: {
      column: 'border-sky-200 bg-sky-100',
      header: 'bg-sky-200 text-sky-900',
      card: 'border-sky-300 bg-sky-200',
      badge: 'bg-sky-300 text-sky-900',
      input: 'border-sky-300 bg-sky-100',
    },
    closed: {
      column: 'border-emerald-200 bg-emerald-100',
      header: 'bg-emerald-200 text-emerald-900',
      card: 'border-emerald-300 bg-emerald-200',
      badge: 'bg-emerald-300 text-emerald-900',
      input: 'border-emerald-300 bg-emerald-100',
    },
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#fffef6_0%,#f8fbff_52%,#eff4ff_100%)] text-slate-900">
      <section className="mx-auto max-w-[1500px] px-6 py-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Operational Board</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Devcraft CMMS - Kanban</h1>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <MetricCard label="Tasks" value={String(totals.count)} />
              <MetricCard label="Estimate (h)" value={totals.estimate.toFixed(1)} />
              <MetricCard label="Spent (h)" value={totals.spent.toFixed(1)} />
              <MetricCard label="Closed Effort (h)" value={totals.completedSpent.toFixed(1)} />
            </div>
          </div>
        </header>

        <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          {tasksQuery.isLoading ? 'Loading tasks from API...' : null}
          {tasksQuery.isError ? 'Failed to load tasks. Verify API and tenant header.' : null}
          {saveError ? saveError : null}
          {isSaving ? 'Saving changes...' : null}
        </section>

        <section className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-white/85 p-4 lg:grid-cols-[2fr_auto]">
          <div className="grid gap-2">
            <input
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Search by id, title, module, assignee..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            className="h-fit rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            New task
          </button>
        </section>

        <section className="mb-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => setIsChangelogOpen(true)}
          >
            View changelog
          </button>
          <button
            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          {taskStatusOrder.map((status) => {
            const columnTasks = filteredTasks.filter((task) => task.status === status)
            const style = columnStyleByStatus[status]
            return (
              <article
                key={status}
                className={`min-h-[420px] rounded-2xl border p-3 ${style.column}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingTaskId) {
                    updateTaskStatusById(draggingTaskId, status)
                  }
                  setDraggingTaskId(null)
                }}
              >
                <header className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${style.header}`}>
                  <h3 className="text-sm font-medium">{taskStatusLabel[status]}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${style.badge}`}>{columnTasks.length}</span>
                </header>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`cursor-grab rounded-xl border p-3 text-slate-900 active:cursor-grabbing ${style.card}`}
                      draggable
                      onDragStart={() => setDraggingTaskId(task.id)}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-700">{task.id}</p>
                          <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>
                        </div>
                        <span className={`rounded px-2 py-0.5 text-[11px] ${style.badge}`}>{taskTypeLabel[task.type]}</span>
                      </div>

                      <p className="mb-3 text-xs text-slate-700">Module: {task.module}</p>
                      <p className="mb-3 text-xs text-slate-800">{task.description}</p>

                      <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                        <span className={`rounded border px-2 py-1 ${style.input}`}>Est: {task.estimateHours}h</span>
                        <label className={`rounded border px-2 py-1 ${style.input}`}>
                          Spent:
                          <input
                            className="ml-1 w-14 rounded border border-slate-300 bg-white px-1"
                            type="number"
                            min={0}
                            step={0.5}
                            value={task.spentHours}
                            onChange={(event) => updateSpentHours(task.id, Number(event.target.value))}
                          />
                          h
                        </label>
                      </div>

                      <select
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                        value={task.status}
                        onChange={(event) => updateTaskStatusById(task.id, event.target.value as TaskStatus)}
                      >
                        {getSelectableStatuses(task).map((value) => (
                          <option key={value} value={value}>
                            {taskStatusLabel[value]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </section>
      </section>
      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-400/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Create task</h2>
              <button
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Close
              </button>
            </div>
            <form className="grid gap-3" onSubmit={handleCreateTask}>
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                placeholder="Task title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
              />
              <textarea
                className="min-h-24 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                placeholder="Task description"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  value={newType}
                  onChange={(event) => setNewType(event.target.value as TaskType)}
                >
                  {Object.entries(taskTypeLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  placeholder="Module"
                  value={newModule}
                  onChange={(event) => setNewModule(event.target.value)}
                />
              </div>
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                type="number"
                min={0.5}
                step={0.5}
                value={newEstimate}
                onChange={(event) => setNewEstimate(Number(event.target.value))}
              />
              <button className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500" type="submit">
                Add task
              </button>
            </form>
          </div>
        </div>
      ) : null}
      {selectedTask ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-6"
          onClick={() => setSelectedTaskId(null)}
        >
          <article
            className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-400/40"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">{selectedTask.id}</p>
                <h2 className="text-xl font-semibold text-slate-900">{selectedTask.title}</h2>
              </div>
              <button
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                type="button"
                onClick={() => setSelectedTaskId(null)}
              >
                Close
              </button>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <ModalMetric label="Status" value={taskStatusLabel[selectedTask.status]} />
              <ModalMetric label="Type" value={taskTypeLabel[selectedTask.type]} />
              <ModalMetric label="Estimate" value={`${selectedTask.estimateHours}h`} />
              <ModalMetric label="Spent" value={`${selectedTask.spentHours}h`} />
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium text-slate-700">Module:</span> {selectedTask.module}
              </p>
              <p>
                <span className="font-medium text-slate-700">Assignee:</span> {selectedTask.assignee}
              </p>
              <p>
                <span className="font-medium text-slate-700">Created (Local):</span> {formatLocalTimestamp(selectedTask.createdAtUtc)}
              </p>
              <p>
                <span className="font-medium text-slate-700">Closed (Local):</span>{' '}
                {selectedTask.closedAtUtc ? formatLocalTimestamp(selectedTask.closedAtUtc) : '-'}
              </p>
              <p>
                <span className="font-medium text-slate-700">Closed Spent:</span>{' '}
                {selectedTask.totalSpentHoursOnClose !== null ? `${selectedTask.totalSpentHoursOnClose}h` : '-'}
              </p>
              <p>
                <span className="font-medium text-slate-700">Lead Time On Close:</span>{' '}
                {selectedTask.totalLeadTimeHoursOnClose !== null ? `${selectedTask.totalLeadTimeHoursOnClose}h` : '-'}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
              {selectedTask.description}
            </div>

            <section className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Evidence</h3>
              {selectedTask.evidences.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No evidence attached.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {orderedTaskEvidences.map((evidence) => (
                    isApiEvidence(evidence) ? (
                      <div key={evidence.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm">
                        <div className="flex h-28 items-center justify-center bg-slate-900 px-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-300">
                          API Evidence (JSON)
                        </div>
                        <div className="space-y-1 p-2">
                          <p className="line-clamp-1 text-xs font-medium text-slate-900">{evidence.title}</p>
                          <p className="line-clamp-3 rounded border border-slate-200 bg-slate-50 p-1 text-[11px] text-slate-700">
                            {getApiEvidencePreview(evidence)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatLocalTimestamp(evidence.capturedAtUtc)} - {evidence.source}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        key={evidence.id}
                        className="group overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm"
                        type="button"
                        onClick={() => openEvidenceLightbox(evidence)}
                      >
                        {!resolveEvidenceUrl(evidence.imageUrl) || failedEvidenceImages[evidence.id] ? (
                          <div className="flex h-28 w-full items-center justify-center bg-slate-100 px-2 text-center text-xs text-slate-500">
                            Image unavailable
                          </div>
                        ) : (
                          <img
                            alt={evidence.title}
                            className="h-28 w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                            src={resolveEvidenceUrl(evidence.imageUrl)}
                            onError={() => setFailedEvidenceImages((current) => ({ ...current, [evidence.id]: true }))}
                          />
                        )}
                        <div className="space-y-1 p-2">
                          <p className="line-clamp-1 text-xs font-medium text-slate-900">{evidence.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {formatLocalTimestamp(evidence.capturedAtUtc)} - {evidence.source}
                          </p>
                        </div>
                      </button>
                    )
                  ))}
                </div>
              )}
            </section>
            {orderedTaskEvidences.some((evidence) => isApiEvidence(evidence)) ? (
              <section className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">API Payloads</h3>
                {orderedTaskEvidences
                  .filter((evidence) => isApiEvidence(evidence))
                  .map((evidence) => (
                    <article key={`${evidence.id}-payload`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-900">{evidence.title}</p>
                      <p className="mb-2 text-[11px] text-slate-500">
                        {formatLocalTimestamp(evidence.capturedAtUtc)} - {evidence.source}
                      </p>
                      <pre className="max-h-48 overflow-auto rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-800">
                        {formatApiPayload(evidence.payloadJson)}
                      </pre>
                    </article>
                  ))}
              </section>
            ) : null}
          </article>
        </div>
      ) : null}
      {lightboxEvidence ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setLightboxEvidenceId(null)}
        >
          <div className="flex w-full max-w-6xl items-center gap-3" onClick={(event) => event.stopPropagation()}>
            <button
              className="rounded-md border border-slate-500 bg-slate-900/80 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
              type="button"
              disabled={lightboxIndex <= 0}
              onClick={goToPreviousEvidence}
            >
              Previous
            </button>

            <figure className="max-h-[90vh] flex flex-1 flex-col items-center justify-center">
              <img
                alt={lightboxEvidence.title}
                className="mx-auto block max-h-[82vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                src={resolveEvidenceUrl(lightboxEvidence.imageUrl)}
              />
              <figcaption className="mt-2 text-center text-sm text-slate-100">
                {lightboxEvidence.title} - {formatLocalTimestamp(lightboxEvidence.capturedAtUtc)} ({lightboxIndex + 1}/
                {orderedImageEvidences.length})
              </figcaption>
            </figure>

            <button
              className="rounded-md border border-slate-500 bg-slate-900/80 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
              type="button"
              disabled={lightboxIndex >= orderedImageEvidences.length - 1}
              onClick={goToNextEvidence}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
      {isChangelogOpen ? (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/45 px-4" onClick={() => setIsChangelogOpen(false)}>
          <article
            className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-400/40"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Project Changelog</h2>
              <button
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                type="button"
                onClick={() => setIsChangelogOpen(false)}
              >
                Close
              </button>
            </header>

            {changelogQuery.isLoading ? <p className="text-sm text-slate-600">Loading changelog...</p> : null}
            {changelogQuery.isError ? <p className="text-sm text-rose-600">Failed to load changelog from API.</p> : null}

            {sortedChangelogReleases.map((release) => (
              <section key={`${release.version}-${release.releaseDate}`} className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {release.version} - {release.releaseDate}
                </h3>
                <div className="mt-2 space-y-2">
                  {release.sections.map((section) => (
                    <div key={`${release.version}-${section.category}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{section.category}</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-800">
                        {section.items.map((item) => (
                          <li key={item.id}>{item.description}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      ) : null}
    </main>
  )
}

function getSelectableStatuses(task: KanbanTask): TaskStatus[] {
  if (task.status === 'new') {
    return ['new', 'active']
  }

  if (task.status === 'active') {
    return ['active', 'resolved']
  }

  if (task.status === 'resolved') {
    return task.spentHours > 0 ? ['resolved', 'active', 'closed'] : ['resolved', 'active']
  }

  return ['closed']
}

function isAllowedTransition(current: TaskStatus, next: TaskStatus): boolean {
  if (current === next) {
    return true
  }

  if (current === 'new' && next === 'active') {
    return true
  }

  if (current === 'active' && next === 'resolved') {
    return true
  }

  if (current === 'resolved' && (next === 'active' || next === 'closed')) {
    return true
  }

  return false
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function ModalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function formatLocalTimestamp(value: string): string {
  const date = parseUtcTimestamp(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(date)
}

function parseUtcTimestamp(value: string): Date {
  // Legacy SQLite rows may not include timezone suffix. Treat them as UTC.
  const normalized = /([zZ]|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`
  return new Date(normalized)
}

function resolveEvidenceUrl(imageUrl: string): string {
  if (!imageUrl?.trim()) {
    return ''
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return encodeURI(imageUrl)
  }

  if (imageUrl.startsWith('/')) {
    return encodeURI(imageUrl)
  }

  if (/^[a-zA-Z]:\\/.test(imageUrl)) {
    return ''
  }

  return encodeURI(`/${imageUrl}`)
}

function isApiEvidence(evidence: TaskEvidence): boolean {
  if (evidence.kind === 'api') {
    return true
  }

  return typeof evidence.payloadJson === 'string' && evidence.payloadJson.trim().length > 0
}

function compareEvidenceForDisplay(a: TaskEvidence, b: TaskEvidence): number {
  const aStep = extractStepNumber(a.title)
  const bStep = extractStepNumber(b.title)

  if (aStep !== null && bStep !== null && aStep !== bStep) {
    return aStep - bStep
  }

  if (aStep !== null && bStep === null) {
    return -1
  }

  if (aStep === null && bStep !== null) {
    return 1
  }

  return Date.parse(a.capturedAtUtc) - Date.parse(b.capturedAtUtc)
}

function extractStepNumber(title: string): number | null {
  const match = /^Step\s+(\d+)/i.exec(title.trim())
  if (!match) {
    return null
  }

  const value = Number.parseInt(match[1], 10)
  return Number.isFinite(value) ? value : null
}

function formatApiPayload(payloadJson: string | null): string {
  const parsed = parseApiPayload(payloadJson)
  if (parsed === null) {
    return payloadJson?.trim() || 'No payload content.'
  }

  return JSON.stringify(parsed, null, 2)
}

function getApiEvidencePreview(evidence: TaskEvidence): string {
  const raw = formatApiPayload(evidence.payloadJson)
  return raw.length > 180 ? `${raw.slice(0, 180)}...` : raw
}

function parseApiPayload(payloadJson: string | null): unknown | null {
  if (!payloadJson?.trim()) {
    return null
  }

  try {
    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  return 'Operation failed. Please review task rules and try again.'
}
