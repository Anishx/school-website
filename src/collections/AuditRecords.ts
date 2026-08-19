import { Forbidden, type CollectionConfig, type PayloadRequest } from 'payload'

import { collectionAccessDecision } from '../access/collectionAccess'
import {
  AUDIT_OUTCOMES,
  buildAuditRecordData,
  isTrustedAuditWriteRequest,
  type AuditRecordData,
  type AuditWriteEvent,
} from '../cms/audit/writeAudit'
import { SUPPORTED_ROLES } from '../access/roles'

function denyMutation(req: PayloadRequest): never {
  throw new Forbidden(req.t)
}

function eventFromRecordData(data: Record<string, unknown>): AuditWriteEvent {
  const actor = data.actorType === 'system'
    ? 'system'
    : { id: data.actorId as string, role: data.actorRole as never }

  return {
    actor,
    action: data.action as string,
    target: {
      collection: data.targetCollection as string,
      id: data.targetId as string,
    },
    timestamp: data.occurredAt as string,
    outcome: data.outcome as never,
    metadata: data.metadata,
  }
}

export function createAuditRecordsCollection(): CollectionConfig {
  return {
    slug: 'audit-records',
    timestamps: false,
    admin: {
      useAsTitle: 'action',
      defaultColumns: [
        'occurredAt', 'actorType', 'actorRole', 'action',
        'targetCollection', 'targetId', 'outcome',
      ],
      description: 'Append-only security and workflow audit events.',
    },
    access: {
      create: ({ req }) => isTrustedAuditWriteRequest(req),
      read: ({ req }) => collectionAccessDecision({
        user: req.user,
        resource: 'audit-records',
        operation: 'read',
      }),
      update: () => false,
      delete: () => false,
    },
    fields: [
      {
        name: 'actorType',
        type: 'select',
        required: true,
        index: true,
        options: [
          { label: 'System', value: 'system' },
          { label: 'User', value: 'user' },
        ],
      },
      {
        name: 'actorId',
        type: 'text',
        index: true,
      },
      {
        name: 'actorRole',
        type: 'select',
        index: true,
        options: SUPPORTED_ROLES.map((role) => ({
          label: role[0].toUpperCase() + role.slice(1),
          value: role,
        })),
      },
      {
        name: 'action',
        type: 'text',
        required: true,
        index: true,
        maxLength: 80,
      },
      {
        name: 'targetCollection',
        type: 'text',
        required: true,
        index: true,
        maxLength: 80,
      },
      {
        name: 'targetId',
        type: 'text',
        required: true,
        index: true,
        maxLength: 200,
      },
      {
        name: 'occurredAt',
        type: 'date',
        required: true,
        index: true,
        admin: { date: { pickerAppearance: 'dayAndTime' } },
      },
      {
        name: 'outcome',
        type: 'select',
        required: true,
        index: true,
        options: AUDIT_OUTCOMES.map((outcome) => ({
          label: outcome[0].toUpperCase() + outcome.slice(1),
          value: outcome,
        })),
      },
      {
        name: 'metadata',
        type: 'json',
      },
    ],
    hooks: {
      beforeValidate: [
        ({ data, operation, req }) => {
          if (operation !== 'create' || !isTrustedAuditWriteRequest(req)) {
            return denyMutation(req)
          }
          return buildAuditRecordData(eventFromRecordData(
            (data ?? {}) as Record<string, unknown>,
          )) as AuditRecordData
        },
      ],
      beforeChange: [
        ({ data, operation, req }) => {
          if (operation !== 'create' || !isTrustedAuditWriteRequest(req)) {
            return denyMutation(req)
          }
          return data
        },
      ],
      beforeDelete: [
        ({ req }) => denyMutation(req),
      ],
    },
  }
}

export const AuditRecords: CollectionConfig = createAuditRecordsCollection()
export default AuditRecords
