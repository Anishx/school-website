import {
  type AccessRecord,
  isOwnedOrAssignedDraft,
  isOwner,
} from './collectionAccess'
import {
  type AccessSubject,
  type SupportedRole,
  resolvePrincipal,
} from './roles'

export const FIELD_POLICIES = [
  'user-role',
  'user-active',
  'sensitive-submission',
  'notification-setting',
  'publication-state',
  'publication-audit',
  'assignment',
  'audit',
  'delivery-result',
] as const

export type FieldPolicy = (typeof FIELD_POLICIES)[number]
export type FieldOperation = 'create' | 'read' | 'update'

const fieldPolicySet: ReadonlySet<string> = new Set(FIELD_POLICIES)
const fieldOperationSet: ReadonlySet<string> = new Set(['create', 'read', 'update'])

export function isFieldPolicy(value: unknown): value is FieldPolicy {
  return typeof value === 'string' && fieldPolicySet.has(value)
}

export function isFieldOperation(value: unknown): value is FieldOperation {
  return typeof value === 'string' && fieldOperationSet.has(value)
}

export type FieldAccessInput = Readonly<{
  user: AccessSubject
  policy: FieldPolicy
  operation: FieldOperation
  record?: AccessRecord | null
  value?: unknown
}>

function isRole(role: SupportedRole, allowed: readonly SupportedRole[]): boolean {
  return allowed.includes(role)
}

function canReadOwnAccountField(input: FieldAccessInput): boolean {
  const principal = resolvePrincipal(input.user)
  if (!principal || !isRole(principal.role, ['admin', 'teacher'])) return false
  return input.record != null && isOwner(principal, input.record, 'id')
}

export function canReadSensitiveData(user: AccessSubject): boolean {
  const principal = resolvePrincipal(user)
  return principal !== null && isRole(principal.role, ['principal', 'admin'])
}

export function canManageUserAccessFields(user: AccessSubject): boolean {
  return resolvePrincipal(user)?.role === 'principal'
}

export function canManagePublication(user: AccessSubject): boolean {
  const role = resolvePrincipal(user)?.role
  return role === 'principal' || role === 'admin'
}

export function canContributeToDraft(
  user: AccessSubject,
  record: AccessRecord | null | undefined,
): boolean {
  const principal = resolvePrincipal(user)
  if (!principal) return false
  if (principal.role === 'principal' || principal.role === 'admin') return true
  return principal.role === 'teacher' && isOwnedOrAssignedDraft(principal, record)
}
export function canSetPublicationState(
  user: AccessSubject,
  nextState: unknown,
): boolean {
  if (nextState !== 'draft'
    && nextState !== 'scheduled'
    && nextState !== 'published'
    && nextState !== 'expired'
    && nextState !== 'archived') {
    return false
  }
  return canManagePublication(user)
}

export function fieldAccessDecision(input: FieldAccessInput): boolean {
  if (!isFieldPolicy(input.policy) || !isFieldOperation(input.operation)) return false
  const principal = resolvePrincipal(input.user)
  if (!principal || principal.role === 'parent') return false

  switch (input.policy) {
    case 'user-role':
    case 'user-active':
      if (input.operation === 'read') {
        return principal.role === 'principal' || canReadOwnAccountField(input)
      }
      return principal.role === 'principal'

    case 'sensitive-submission':
    case 'notification-setting':
      return isRole(principal.role, ['principal', 'admin'])

    case 'publication-state':
      if (input.operation === 'read') {
        return isRole(principal.role, ['principal', 'admin'])
          || (principal.role === 'teacher' && isOwnedOrAssignedDraft(principal, input.record))
      }
      return canSetPublicationState(principal, input.value)

    case 'publication-audit':
    case 'assignment':
      return isRole(principal.role, ['principal', 'admin'])

    case 'audit':
      return principal.role === 'principal' && input.operation === 'read'

    case 'delivery-result':
      return input.operation === 'read'
        && isRole(principal.role, ['principal', 'admin'])

    default:
      return false
  }
}
