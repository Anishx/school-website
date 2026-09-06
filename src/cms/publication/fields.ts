import type { Field, FieldAccess } from 'payload'

import { fieldAccessDecision } from '../../access/fieldAccess'
import { PUBLICATION_STATES } from './model'

const createPublicationAccess: FieldAccess = ({ req, data }) => fieldAccessDecision({ user: req.user, policy: 'publication-state', operation: 'create', value: data?.publicationState ?? 'draft' })
const updatePublicationAccess: FieldAccess = ({ req, doc, data }) => fieldAccessDecision({
  user: req.user,
  policy: 'publication-state',
  operation: 'update',
  record: doc,
  value: data?.publicationState,
})

const publicationFieldAccess = {
  create: createPublicationAccess,
  read: () => true,
  update: updatePublicationAccess,
}

export const publicationFields: Field[] = [
  {
    name: 'publicationState',
    type: 'select',
    required: true,
    defaultValue: 'draft',
    index: true,
    options: PUBLICATION_STATES.map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value })),
    admin: { position: 'sidebar' },
    access: publicationFieldAccess,
  },
  { name: 'publishAt', type: 'date', index: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
  { name: 'expiresAt', type: 'date', index: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
  { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
  { name: 'publicationActor', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar', readOnly: true } },
  { name: 'publicationChangedAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
  { name: 'createdBy', type: 'relationship', relationTo: 'users', index: true, admin: { position: 'sidebar', readOnly: true } },
  { name: 'assignedEditors', type: 'relationship', relationTo: 'users', hasMany: true, admin: { position: 'sidebar' } },
  { name: 'migrationId', type: 'text', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
  { name: 'migrationSource', type: 'text', admin: { position: 'sidebar', readOnly: true } },
  { name: 'migrationFingerprint', type: 'text', admin: { position: 'sidebar', readOnly: true } },
]
