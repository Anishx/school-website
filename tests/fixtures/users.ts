export type SyntheticUserRole = 'principal' | 'admin' | 'teacher' | 'parent' | 'staff'

export type SyntheticUser = Readonly<{
  id: string
  name: string
  email: string
  password: string
  role: SyntheticUserRole
  active: boolean
  assignedSections: readonly string[]
}>

const defaultUser: SyntheticUser = {
  id: 'user-synthetic-001',
  name: 'Synthetic Test User',
  email: 'user-001@example.test',
  password: 'Synthetic-Passphrase-001!',
  role: 'admin',
  active: true,
  assignedSections: [],
}

export function buildUser(overrides: Partial<SyntheticUser> = {}): SyntheticUser {
  return {
    ...defaultUser,
    ...overrides,
    assignedSections: [...(overrides.assignedSections ?? defaultUser.assignedSections)],
  }
}
