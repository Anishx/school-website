import { describe, expect, it } from 'vitest'
import { resolveStudentLifeTab, studentLifeVisibilityFromRecord, visibleStudentLifeTabIndices } from '../../src/cms/public/student-life'

describe('Student Life visibility', () => {
  it('preserves every tab for existing settings', () => {
    for (const record of [undefined, null, {}]) {
      expect(visibleStudentLifeTabIndices(studentLifeVisibilityFromRecord(record))).toEqual([0, 1, 2, 3, 4])
    }
  })

  it('hides Achievements and redirects its deep link to the first visible tab', () => {
    const visible = visibleStudentLifeTabIndices(studentLifeVisibilityFromRecord({ achievements: false }))
    expect(visible).toEqual([0, 1, 2, 3])
    expect(resolveStudentLifeTab('achievements', visible)).toBe(0)
  })

  it('preserves tab identities when earlier tabs are hidden', () => {
    const visible = visibleStudentLifeTabIndices(studentLifeVisibilityFromRecord({ sports: false, clubs: false }))
    expect(resolveStudentLifeTab('leadership', visible)).toBe(3)
    expect(resolveStudentLifeTab(null, visible)).toBe(2)
    expect(resolveStudentLifeTab('unknown', visible)).toBe(2)
    expect(resolveStudentLifeTab('sports', visible)).toBe(2)
  })

  it('handles all tabs hidden without restoring content', () => {
    const visible = visibleStudentLifeTabIndices(studentLifeVisibilityFromRecord({ sports: false, clubs: false, stem: false, leadership: false, achievements: false }))
    expect(visible).toEqual([])
    expect(resolveStudentLifeTab('achievements', visible)).toBe(-1)
  })
})
