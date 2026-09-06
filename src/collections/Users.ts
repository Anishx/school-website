import {
  AuthenticationError,
  Forbidden,
  ValidationError,
  type CollectionConfig,
  type PayloadRequest,
} from 'payload'

import { collectionAccessDecision } from '../access/collectionAccess'
import { canManageUserAccessFields, fieldAccessDecision } from '../access/fieldAccess'
import {
  SUPPORTED_ROLES,
  CONTENT_PERMISSIONS,
  canEnterPayloadAdmin,
  resolvePrincipal,
  supportedRole,
  type PrincipalID,
  type SupportedRole,
} from '../access/roles'

export const MINIMUM_PASSWORD_LENGTH = 12
export const LEGACY_STAFF_ROLE = 'staff'

export type StoredUserRole = SupportedRole | typeof LEGACY_STAFF_ROLE
export type UserAccessDocument = Readonly<{
  id: PrincipalID
  role?: unknown
  active?: unknown
  contentAccess?: unknown
  contentPermissions?: unknown
}>

export type UserAccessAuditEvent = Readonly<{
  actor: Readonly<{ id: PrincipalID; role: SupportedRole }> | 'system'
  action: 'user-access-created' | 'user-access-changed'
  target: Readonly<{ collection: 'users'; id: PrincipalID }>
  timestamp: string
  changes: Readonly<{
    role?: Readonly<{ from: StoredUserRole | null; to: StoredUserRole | null }>
    active?: Readonly<{ from: boolean | null; to: boolean | null }>
    contentAccess?: Readonly<{ from: unknown; to: unknown }>
  }>
}>

export type UserAccessAuditWriter = (
  event: UserAccessAuditEvent,
  req: PayloadRequest,
) => Promise<void> | void

let deferredAuditWriter: UserAccessAuditWriter | null = null

/** Task 2.3 registers its trusted writer here when audit-records is composed. */
export function registerUserAccessAuditWriter(writer: UserAccessAuditWriter): () => void {
  deferredAuditWriter = writer
  return () => {
    if (deferredAuditWriter === writer) deferredAuditWriter = null
  }
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function storedRole(value: unknown): StoredUserRole | null {
  return supportedRole(value) ?? (value === LEGACY_STAFF_ROLE ? LEGACY_STAFF_ROLE : null)
}

function activeValue(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

export function isPasswordAccepted(value: unknown): value is string {
  return typeof value === 'string' && Array.from(value).length >= MINIMUM_PASSWORD_LENGTH
}

function rejectPassword(req?: Partial<PayloadRequest>): never {
  throw new ValidationError({
    collection: 'users',
    errors: [{
      path: 'password',
      message: `Password must contain at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
    }],
    req,
  })
}

export function validateSuppliedPassword(
  data: Readonly<Record<string, unknown>> | null | undefined,
  req?: Partial<PayloadRequest>,
): void {
  if (!data || !hasOwn(data, 'password')) return
  if (!isPasswordAccepted(data.password)) rejectPassword(req)
}

async function countUsers(req: PayloadRequest): Promise<number> {
  const result = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  })
  return result.totalDocs
}

export async function bootstrapFirstUser(
  data: Record<string, unknown> | undefined,
  req: PayloadRequest,
): Promise<Record<string, unknown>> {
  const nextData = data ?? {}
  if (await countUsers(req) === 0) {
    nextData.role = 'principal'
    nextData.active = true
    return nextData
  }

  if (!canManageUserAccessFields(req.user)) throw new Forbidden(req.t)
  return nextData
}

export function wouldRemoveActivePrincipal(
  original: Pick<UserAccessDocument, 'role' | 'active'>,
  next: Pick<UserAccessDocument, 'role' | 'active'>,
): boolean {
  return original.role === 'principal'
    && original.active === true
    && (next.role !== 'principal' || next.active !== true)
}

async function assertAnotherActivePrincipal(
  req: PayloadRequest,
  excludedID: PrincipalID,
): Promise<void> {
  const result = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    where: {
      and: [
        { id: { not_equals: excludedID } },
        { role: { equals: 'principal' } },
        { active: { equals: true } },
      ],
    },
  })
  if (result.totalDocs === 0) throw new Forbidden(req.t)
}

function nextAccessState(
  data: Readonly<Record<string, unknown>>,
  original?: UserAccessDocument,
): UserAccessDocument {
  return {
    id: original?.id ?? '',
    role: hasOwn(data, 'role') ? data.role : original?.role,
    active: hasOwn(data, 'active') ? data.active : original?.active,
  }
}

export function buildUserAccessAuditEvent(
  doc: UserAccessDocument,
  previous: UserAccessDocument | null | undefined,
  actorInput: unknown,
  timestamp = new Date().toISOString(),
): UserAccessAuditEvent | null {
  const fromRole = storedRole(previous?.role)
  const toRole = storedRole(doc.role)
  const fromActive = activeValue(previous?.active)
  const toActive = activeValue(doc.active)
  const changes: UserAccessAuditEvent['changes'] = {
    ...(fromRole !== toRole ? { role: { from: fromRole, to: toRole } } : {}),
    ...(fromActive !== toActive ? { active: { from: fromActive, to: toActive } } : {}),
    ...(JSON.stringify(accessSummary(previous)) !== JSON.stringify(accessSummary(doc))
      ? { contentAccess: { from: accessSummary(previous), to: accessSummary(doc) } } : {}),
  }
  if (!changes.role && !changes.active && !changes.contentAccess) return null

  const actor = resolvePrincipal(actorInput as Parameters<typeof resolvePrincipal>[0])
  return Object.freeze({
    actor: actor ? Object.freeze({ id: actor.id, role: actor.role }) : 'system',
    action: previous ? 'user-access-changed' : 'user-access-created',
    target: Object.freeze({ collection: 'users', id: doc.id }),
    timestamp,
    changes: Object.freeze(changes),
  })
}

function accessSummary(doc?: UserAccessDocument | null) {
  return {
    mode: doc?.contentAccess === 'custom' ? 'custom' : 'role',
    edit: Array.isArray(doc?.contentPermissions) && doc.contentPermissions.includes('edit'),
    remove: Array.isArray(doc?.contentPermissions) && doc.contentPermissions.includes('remove'),
    approve: Array.isArray(doc?.contentPermissions) && doc.contentPermissions.includes('approve'),
  }
}

async function enforceUserMutation(args: {
  data: Record<string, unknown>
  operation: 'create' | 'update'
  originalDoc?: UserAccessDocument
  req: PayloadRequest
}): Promise<Record<string, unknown>> {
  const { data, operation, originalDoc, req } = args
  const actor = resolvePrincipal(req.user)
  const next = nextAccessState(data, originalDoc)
  const roleChanged = operation === 'create'
    ? hasOwn(data, 'role')
    : hasOwn(data, 'role') && data.role !== originalDoc?.role
  const activeChanged = operation === 'create'
    ? hasOwn(data, 'active')
    : hasOwn(data, 'active') && data.active !== originalDoc?.active

  if (actor?.role === 'admin'
    && (originalDoc?.role === 'principal' || next.role === 'principal')) {
    throw new Forbidden(req.t)
  }
  const permissionsChanged = ['contentAccess', 'contentPermissions'].some((field) => hasOwn(data, field)
    && JSON.stringify(data[field]) !== JSON.stringify(originalDoc?.[field as keyof UserAccessDocument]))
  if (actor && !canManageUserAccessFields(req.user) && (roleChanged || activeChanged || permissionsChanged)) {
    throw new Forbidden(req.t)
  }
  if (hasOwn(data, 'contentAccess') && !['role', 'custom'].includes(String(data.contentAccess))) {
    throw new ValidationError({ collection: 'users', errors: [{ path: 'contentAccess', message: 'Choose role defaults or custom permissions.' }], req })
  }
  if (data.contentPermissions != null && (!Array.isArray(data.contentPermissions)
    || data.contentPermissions.some((permission) => !CONTENT_PERMISSIONS.includes(permission)))) {
    throw new ValidationError({ collection: 'users', errors: [{ path: 'contentPermissions', message: 'Choose supported content permissions.' }], req })
  }

  const nextRole = storedRole(next.role)
  const preservingLegacyStaff = operation === 'update'
    && originalDoc?.role === LEGACY_STAFF_ROLE
    && next.role === LEGACY_STAFF_ROLE
  if (!nextRole || (nextRole === LEGACY_STAFF_ROLE && !preservingLegacyStaff)) {
    throw new ValidationError({
      collection: 'users',
      errors: [{ path: 'role', message: 'Select a supported user role.' }],
      req,
    })
  }

  if (originalDoc && wouldRemoveActivePrincipal(originalDoc, next)) {
    await assertAnotherActivePrincipal(req, originalDoc.id)
  }
  return data
}

async function enforcePrincipalDelete(args: {
  id: PrincipalID
  req: PayloadRequest
}): Promise<void> {
  const doc = await args.req.payload.findByID({
    collection: 'users',
    id: args.id,
    overrideAccess: true,
    req: args.req,
  }) as UserAccessDocument
  if (resolvePrincipal(args.req.user)?.role === 'admin' && doc.role === 'principal') throw new Forbidden(args.req.t)
  if (doc.role === 'principal' && doc.active === true) {
    await assertAnotherActivePrincipal(args.req, args.id)
  }
}

export function assertAuthenticationEligible(
  user: Pick<UserAccessDocument, 'active'>,
  req?: PayloadRequest,
): void {
  if (user.active !== true) throw new AuthenticationError(req?.t)
}

export type CreateUsersCollectionOptions = Readonly<{
  isProduction?: boolean
  writeAudit?: UserAccessAuditWriter
}>

export function createUsersCollection(
  options: CreateUsersCollectionOptions = {},
): CollectionConfig {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === 'production'
  const writeAudit: UserAccessAuditWriter = async (event, req) => {
    const writer = options.writeAudit ?? deferredAuditWriter
    if (writer) await writer(event, req)
  }

  return {
    slug: 'users',
    auth: {
      cookies: {
        sameSite: 'Lax',
        secure: isProduction,
      },
    },
    admin: {
      useAsTitle: 'email',
      defaultColumns: ['name', 'email', 'role', 'active', 'updatedAt'],
    },
    access: {
      admin: ({ req }) => canEnterPayloadAdmin(req.user),
      create: async ({ req }) => {
        const decision = collectionAccessDecision({
          user: req.user,
          resource: 'users',
          operation: 'create',
        })
        return decision === true || (!req.user && await countUsers(req) === 0)
      },
      read: ({ req }) => collectionAccessDecision({
        user: req.user,
        resource: 'users',
        operation: 'read',
      }),
      update: ({ req }) => collectionAccessDecision({
        user: req.user,
        resource: 'users',
        operation: 'update',
      }),
      delete: ({ req }) => collectionAccessDecision({
        user: req.user,
        resource: 'users',
        operation: 'delete',
      }),
    },
    fields: [
      {
        name: 'name',
        type: 'text',
      },
      {
        name: 'role',
        type: 'select',
        required: true,
        defaultValue: 'parent',
        saveToJWT: true,
        admin: { description: 'Admins can manage Admin, Teacher, and Parent accounts. Principal accounts are managed by a Principal.' },
        options: [
          ...SUPPORTED_ROLES.map((role) => ({
            label: role[0].toUpperCase() + role.slice(1),
            value: role,
          })),
          { label: 'Staff (legacy — reassignment required)', value: LEGACY_STAFF_ROLE },
        ],
        access: {
          create: ({ req }) => fieldAccessDecision({
            user: req.user, policy: 'user-role', operation: 'create',
          }),
          read: ({ req, doc }) => fieldAccessDecision({
            user: req.user, policy: 'user-role', operation: 'read', record: doc,
          }),
          update: ({ req, doc, data }) => fieldAccessDecision({
            user: req.user,
            policy: 'user-role',
            operation: 'update',
            record: doc,
            value: data?.role,
          }),
        },
      },
      {
        name: 'active',
        type: 'checkbox',
        required: true,
        defaultValue: true,
        saveToJWT: true,
        access: {
          create: ({ req }) => fieldAccessDecision({
            user: req.user, policy: 'user-active', operation: 'create',
          }),
          read: ({ req, doc }) => fieldAccessDecision({
            user: req.user, policy: 'user-active', operation: 'read', record: doc,
          }),
          update: ({ req, doc, data }) => fieldAccessDecision({
            user: req.user,
            policy: 'user-active',
            operation: 'update',
            record: doc,
            value: data?.active,
          }),
        },
      },
      {
        name: 'contentAccess', type: 'select', defaultValue: 'role',
        label: 'Website content access',
        options: [{ label: 'Role defaults', value: 'role' }, { label: 'Custom staff permissions', value: 'custom' }],
        admin: { description: 'Custom permissions apply to Teachers. Administrators and Principals retain full content access; Parents cannot enter the CMS.' },
        access: {
          create: ({ req }) => canManageUserAccessFields(req.user),
          update: ({ req }) => canManageUserAccessFields(req.user),
          read: ({ req }) => canEnterPayloadAdmin(req.user),
        },
      },
      {
        name: 'contentPermissions', type: 'select', hasMany: true,
        label: 'Website permissions',
        options: [
          { label: 'Create and edit content / upload images', value: 'edit' },
          { label: 'Remove content and unused images', value: 'remove' },
          { label: 'Approve, publish, schedule, and withdraw content', value: 'approve' },
        ],
        admin: { condition: (_, siblingData) => siblingData?.contentAccess === 'custom', description: 'Applies across website sections, news, downloads, and Media Library. Editing without approval is limited to drafts.' },
        access: {
          create: ({ req }) => canManageUserAccessFields(req.user),
          update: ({ req }) => canManageUserAccessFields(req.user),
          read: ({ req }) => canEnterPayloadAdmin(req.user),
        },
      },
      {
        name: 'assignedSections',
        type: 'relationship',
        relationTo: 'content-sections',
        hasMany: true,
        access: {
          create: ({ req }) => fieldAccessDecision({
            user: req.user, policy: 'assignment', operation: 'create',
          }),
          read: ({ req, doc }) => fieldAccessDecision({
            user: req.user, policy: 'assignment', operation: 'read', record: doc,
          }),
          update: ({ req, doc }) => fieldAccessDecision({
            user: req.user, policy: 'assignment', operation: 'update', record: doc,
          }),
        },
      },
    ],
    hooks: {
      beforeOperation: [
        ({ operation, args, req }) => {
          if (operation === 'resetPassword') {
            validateSuppliedPassword(args.data as Record<string, unknown>, req)
          }
        },
      ],
      beforeValidate: [
        async ({ data, operation, req }) => {
          validateSuppliedPassword(data as Record<string, unknown> | undefined, req)
          if (operation === 'create') {
            return bootstrapFirstUser(data as Record<string, unknown> | undefined, req)
          }
          return data
        },
      ],
      beforeChange: [
        ({ data, operation, originalDoc, req }) => enforceUserMutation({
          data: data as Record<string, unknown>,
          operation,
          originalDoc: originalDoc as UserAccessDocument | undefined,
          req,
        }),
      ],
      afterChange: [
        async ({ doc, operation, previousDoc, req }) => {
          const event = buildUserAccessAuditEvent(
            doc as UserAccessDocument,
            operation === 'create' ? null : previousDoc as UserAccessDocument,
            req.user,
          )
          if (event) await writeAudit(event, req)
          return doc
        },
      ],
      beforeDelete: [
        ({ id, req }) => enforcePrincipalDelete({ id, req }),
      ],
      beforeLogin: [
        ({ user, req }) => {
          assertAuthenticationEligible(user as UserAccessDocument, req)
          return user
        },
      ],
    },
  }
}

export const Users: CollectionConfig = createUsersCollection()
export default Users
