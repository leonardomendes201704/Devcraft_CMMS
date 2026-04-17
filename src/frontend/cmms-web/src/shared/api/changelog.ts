import { apiFetch } from './http'

export interface ProjectChangelogItem {
  id: string
  description: string
  source: string
  createdAtUtc: string
}

export interface ProjectChangelogSection {
  category: string
  items: ProjectChangelogItem[]
}

export interface ProjectChangelogRelease {
  version: string
  releaseDate: string
  sections: ProjectChangelogSection[]
}

export async function listProjectChangelog() {
  return apiFetch<ProjectChangelogRelease[]>('/api/changelog')
}
