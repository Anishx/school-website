import { describe, expect, it } from 'vitest'

import { contentForSource } from '../../src/cms/public/content-source'

const legacy = [{ id: 'existing', title: 'Existing' }, { id: 'shared', title: 'Old title' }]
const managed = [{ id: 'new', title: 'New' }, { id: 'shared', title: 'Updated title' }]

describe('contentForSource', () => {
  it('keeps only existing website content in legacy mode', () => {
    expect(contentForSource('legacy', legacy, managed, (item) => item.id)).toEqual(legacy)
  })

  it('keeps only CMS content in managed mode', () => {
    expect(contentForSource('managed', legacy, managed, (item) => item.id)).toEqual(managed)
  })

  it('appends CMS content and lets CMS replace matching legacy items', () => {
    expect(contentForSource('append', legacy, managed, (item) => item.id)).toEqual([
      { id: 'existing', title: 'Existing' },
      { id: 'shared', title: 'Updated title' },
      { id: 'new', title: 'New' },
    ])
  })
})
