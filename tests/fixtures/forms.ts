export type SyntheticFormField = Readonly<{
  name: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'radio' | 'checkbox' | 'consent' | 'date'
  required: boolean
  options?: readonly string[]
}>

export type SyntheticForm = Readonly<{
  id: string
  slug: string
  type: 'contact' | 'feedback' | 'event_registration'
  title: string
  enabled: boolean
  fields: readonly SyntheticFormField[]
  publicationState: 'draft' | 'scheduled' | 'published' | 'expired' | 'archived'
  publishAt: string
  expiresAt: string | null
}>

const defaultFields: readonly SyntheticFormField[] = [
  { name: 'name', label: 'Synthetic name', type: 'text', required: true },
  { name: 'email', label: 'Synthetic email', type: 'email', required: true },
  { name: 'consent', label: 'Synthetic consent', type: 'consent', required: true },
]

export function buildForm(overrides: Partial<SyntheticForm> = {}): SyntheticForm {
  return {
    id: 'form-synthetic-001', slug: 'synthetic-contact', type: 'contact',
    title: 'Synthetic Contact Form', enabled: true,
    publicationState: 'published', publishAt: '2030-01-01T00:00:00.000Z',
    expiresAt: null, ...overrides,
    fields: (overrides.fields ?? defaultFields).map((field) => ({
      ...field, options: field.options ? [...field.options] : undefined,
    })),
  }
}

export function buildFormSubmission(overrides: Readonly<Record<string, unknown>> = {}) {
  return { id: 'submission-synthetic-001', referenceCode: 'TEST-FORM-001',
    form: 'form-synthetic-001', values: { name: 'Synthetic Visitor', email: 'visitor@example.test', consent: true },
    submittedAt: '2030-01-15T10:00:00.000Z', reviewStatus: 'new', ...overrides }
}
