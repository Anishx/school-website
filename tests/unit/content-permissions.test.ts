import { Forbidden, ValidationError, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { collectionAccessDecision, canAccessCollectionRecord } from '../../src/access/collectionAccess'
import { fieldAccessDecision, canManagePublication } from '../../src/access/fieldAccess'
import { createUsersCollection, buildUserAccessAuditEvent, bootstrapFirstUser } from '../../src/collections/Users'
import { preparePublicationChange } from '../../src/cms/publication/model'

const admin = { id: 'admin-1', role: 'admin', active: true }
const teacher = (permissions: string[]) => ({ id: 'teacher-1', role: 'teacher', active: true, contentAccess: 'custom', contentPermissions: permissions })
const req = (user: unknown) => ({ user, context: {}, payload: { count: async () => ({ totalDocs: 1 }) } }) as unknown as PayloadRequest

describe('administrator-managed staff permissions', () => {
  it('lets an Admin create accounts and change non-Principal roles and grants', async () => {
    expect(collectionAccessDecision({ user: admin, resource: 'users', operation: 'create' })).toBe(true)
    await expect(bootstrapFirstUser({ role: 'teacher' }, req(admin))).resolves.toMatchObject({ role: 'teacher' })
    expect(canAccessCollectionRecord({ user: admin, resource: 'users', operation: 'update', record: { id: 'another', role: 'teacher' } })).toBe(true)
    expect(fieldAccessDecision({ user: admin, policy: 'user-role', operation: 'update', record: { role: 'teacher' }, value: 'admin' })).toBe(true)
    const hook = createUsersCollection().hooks!.beforeChange![0]
    await expect(hook({ data: { role: 'admin', contentAccess: 'custom', contentPermissions: ['edit', 'approve'] }, operation: 'update', originalDoc: { id: 't1', role: 'teacher', active: true }, req: req(admin) } as never)).resolves.toMatchObject({ role: 'admin' })
  })

  it('prevents staff self-escalation and protects Principal accounts', async () => {
    const hook = createUsersCollection().hooks!.beforeChange![0]
    const originalDoc = { id: 'teacher-1', role: 'teacher', active: true }
    await expect(hook({ data: { contentPermissions: ['approve'] }, operation: 'update', originalDoc, req: req(teacher(['edit'])) } as never)).rejects.toBeInstanceOf(Forbidden)
    await expect(hook({ data: { role: 'principal' }, operation: 'update', originalDoc, req: req(admin) } as never)).rejects.toBeInstanceOf(Forbidden)
    expect(canAccessCollectionRecord({ user: admin, resource: 'users', operation: 'delete', record: { id: 'p1', role: 'principal' } })).toBe(false)
  })

  it('separates draft editing, removal, and approval', () => {
    const editor = teacher(['edit'])
    expect(collectionAccessDecision({ user: editor, resource: 'editorial', operation: 'update' })).toEqual({ publicationState: { equals: 'draft' } })
    expect(collectionAccessDecision({ user: editor, resource: 'editorial', operation: 'delete' })).toBe(false)
    expect(canManagePublication(editor)).toBe(false)
    expect(collectionAccessDecision({ user: teacher(['remove']), resource: 'editorial', operation: 'delete' })).toBe(true)
    expect(collectionAccessDecision({ user: teacher(['remove']), resource: 'editorial', operation: 'create', requestedPublicationState: 'draft' })).toBe(false)
    const approver = teacher(['approve'])
    expect(canManagePublication(approver)).toBe(true)
    expect(preparePublicationChange({ data: { publicationState: 'published' }, originalDoc: { title: 'Reviewed text', publicationState: 'draft' }, req: req(approver) })).toMatchObject({ publicationState: 'published' })
    expect(() => preparePublicationChange({ data: { title: 'Changed text', publicationState: 'published' }, originalDoc: { title: 'Reviewed text', publicationState: 'draft' }, req: req(approver) })).toThrow(ValidationError)
  })

  it('fails closed for no grants, Parents, inactive accounts and revocation', () => {
    for (const user of [teacher([]), { ...teacher(['edit', 'remove', 'approve']), active: false }, { ...teacher(['edit', 'approve']), role: 'parent' }]) {
      expect(collectionAccessDecision({ user, resource: 'media', operation: 'create' })).toBe(false)
      expect(canManagePublication(user)).toBe(false)
    }
    expect(canManagePublication(teacher(['approve']))).toBe(true)
    expect(canManagePublication(teacher([]))).toBe(false)
  })

  it('audits grant changes without unrelated user data', () => {
    const event = buildUserAccessAuditEvent(teacher(['edit', 'approve']), teacher(['edit']), admin)
    expect(event?.changes.contentAccess).toEqual({ from: { mode: 'custom', edit: true, remove: false, approve: false }, to: { mode: 'custom', edit: true, remove: false, approve: true } })
  })
})
