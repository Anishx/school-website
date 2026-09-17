export const STUDENT_LIFE_TABS = [
  { key: 'sports', label: 'Sports' },
  { key: 'clubs', label: 'Clubs & Activities' },
  { key: 'stem', label: 'STEM Activities' },
  { key: 'leadership', label: 'Leadership Programmes' },
  { key: 'achievements', label: 'Achievements' },
] as const

export type StudentLifeTabKey = typeof STUDENT_LIFE_TABS[number]['key']
export type StudentLifeVisibility = Readonly<Record<StudentLifeTabKey, boolean>>

export function studentLifeVisibilityFromRecord(value: unknown): StudentLifeVisibility {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  return Object.fromEntries(STUDENT_LIFE_TABS.map(({ key }) => [key, record[key] !== false])) as StudentLifeVisibility
}

export function visibleStudentLifeTabIndices(visibility: StudentLifeVisibility): number[] {
  return STUDENT_LIFE_TABS.flatMap(({ key }, index) => visibility[key] ? [index] : [])
}

export function resolveStudentLifeTab(requested: string | null, visible: readonly number[]): number {
  const index = STUDENT_LIFE_TABS.findIndex(({ key }) => key === requested)
  return visible.includes(index) ? index : visible[0] ?? -1
}
