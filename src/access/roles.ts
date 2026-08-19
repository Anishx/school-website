export const SUPPORTED_ROLES = ['principal', 'admin', 'teacher', 'parent'] as const

export type SupportedRole = (typeof SUPPORTED_ROLES)[number]
export type PrincipalID = string | number

export type AccessSubject = Readonly<{
  id?: unknown
  role?: unknown
  active?: unknown
}> | null | undefined

export type AuthenticatedPrincipal = Readonly<{
  id: PrincipalID
  role: SupportedRole
  active: true
}>

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

  return Object.freeze({ id: subject.id, role, active: true })
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
