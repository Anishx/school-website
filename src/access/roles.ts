export const SUPPORTED_ROLES = ['principal', 'admin', 'teacher', 'parent'] as const

export type SupportedRole = (typeof SUPPORTED_ROLES)[number]
export type PrincipalID = string | number

export type AccessSubject = Readonly<{
  id?: unknown
  role?: unknown
  active?: unknown
  contentAccess?: unknown
  contentPermissions?: unknown
}> | null | undefined

export type AuthenticatedPrincipal = Readonly<{
  id: PrincipalID
  role: SupportedRole
  active: true
  contentAccess?: 'custom'
  contentPermissions?: readonly ContentPermission[]
}>

export const CONTENT_PERMISSIONS = ['edit', 'remove', 'approve'] as const
export type ContentPermission = (typeof CONTENT_PERMISSIONS)[number]

export function hasContentPermission(subject: AccessSubject, permission: ContentPermission): boolean {
  const principal = resolvePrincipal(subject)
  if (!principal) return false
  if (principal.role === 'admin' || principal.role === 'principal') return true
  return principal.role === 'teacher' && principal.contentAccess === 'custom'
    && principal.contentPermissions?.includes(permission) === true
}

const supportedRoleSet: ReadonlySet<string> = new Set(SUPPORTED_ROLES)

export function isPrincipalID(value: unknown): value is PrincipalID {
  return (typeof value === 'string' && value.trim().length > 0)
    || (typeof value === 'number' && Number.isFinite(value))
}

export function supportedRole(value: unknown): SupportedRole | null {
  return typeof value === 'string' && supportedRoleSet.has(value)
    ? value as SupportedRole
    : null
}

export function resolvePrincipal(subject: AccessSubject): AuthenticatedPrincipal | null {
  if (!subject || subject.active !== true || !isPrincipalID(subject.id)) return null

  const role = supportedRole(subject.role)
  if (!role) return null

  return Object.freeze({ id: subject.id, role, active: true,
    ...(subject.contentAccess === 'custom' ? {
      contentAccess: 'custom' as const,
      contentPermissions: Object.freeze(Array.isArray(subject.contentPermissions)
        ? subject.contentPermissions.filter((value): value is ContentPermission => CONTENT_PERMISSIONS.includes(value)) : []),
    } : {}),
  })
}

export function hasRole(subject: AccessSubject, ...roles: readonly SupportedRole[]): boolean {
  const principal = resolvePrincipal(subject)
  return principal !== null && roles.includes(principal.role)
}

export function isPrincipal(subject: AccessSubject): boolean {
  return hasRole(subject, 'principal')
}

export function isAdmin(subject: AccessSubject): boolean {
  return hasRole(subject, 'admin')
}

export function isTeacher(subject: AccessSubject): boolean {
  return hasRole(subject, 'teacher')
}

export function isParent(subject: AccessSubject): boolean {
  return hasRole(subject, 'parent')
}

export function canEnterPayloadAdmin(subject: AccessSubject): boolean {
  return hasRole(subject, 'principal', 'admin', 'teacher')
}

export function canManageAllContent(subject: AccessSubject): boolean {
  return hasRole(subject, 'principal', 'admin')
}
