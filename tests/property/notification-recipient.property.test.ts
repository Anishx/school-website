import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { selectNotificationRecipient } from '../../src/cms/notifications/recipient'
import type { NotificationSettingsDocument } from '../../src/globals/NotificationSettings'

// Feature: payload-cms-expansion, Property 4: Notification recipient selection is deterministic
// **Validates: Requirements 3.1, 3.5, 3.6, 7.16, 7.17, 7.18**

type GeneratedRecipient = Readonly<{
  input: string | null
  normalized: string | null
}>

const validRecipientArbitrary: fc.Arbitrary<GeneratedRecipient> = fc
  .tuple(fc.integer({ min: 0, max: 1_000_000 }), fc.boolean())
  .map(([id, uppercase]) => {
    const normalized = `recipient-${id}@example.test`
    const address = uppercase ? normalized.toUpperCase() : normalized
    return { input: `  ${address}  `, normalized }
  })

const invalidRecipientArbitrary: fc.Arbitrary<GeneratedRecipient> = fc
  .tuple(
    fc.integer({ min: 0, max: 1_000_000 }),
    fc.constantFrom('unset', 'blank', 'missing-at', 'missing-domain', 'double-at', 'whitespace'),
  )
  .map(([id, kind]) => {
    const values: Record<string, string | null> = {
      unset: null,
      blank: '   ',
      'missing-at': `recipient-${id}.example.test`,
      'missing-domain': `recipient-${id}@example`,
      'double-at': `recipient-${id}@@example.test`,
      whitespace: `recipient ${id}@example.test`,
    }
    return { input: values[kind], normalized: null }
  })

const recipientArbitrary = fc.oneof(validRecipientArbitrary, invalidRecipientArbitrary)
const sourceTypeArbitrary = fc.constantFrom<'admission' | 'form_submission'>(
  'admission',
  'form_submission',
)

function settingsFor(
  sourceType: 'admission' | 'form_submission',
  enabled: boolean,
  cmsRecipient: string | null,
): NotificationSettingsDocument {
  if (sourceType === 'admission') {
    return { admissionEnabled: enabled, admissionRecipient: cmsRecipient }
  }

  return {
    defaultFormEnabled: true,
    formOverrides: [{
      form: 'synthetic-form-001',
      enabled,
      recipient: cmsRecipient,
    }],
  }
}

describe('notification recipient selection property', () => {
  it('selects disabled, CMS, environment, or not configured with deterministic precedence', () => {
    fc.assert(
      fc.property(
        sourceTypeArbitrary,
        fc.boolean(),
        recipientArbitrary,
        recipientArbitrary,
        (sourceType, enabled, cmsRecipient, environmentRecipient) => {
          const input = {
            sourceType,
            formId: sourceType === 'form_submission' ? 'synthetic-form-001' : undefined,
            settings: settingsFor(sourceType, enabled, cmsRecipient.input),
            environmentRecipient: environmentRecipient.input,
          } as const

          const expected = !enabled
            ? { outcome: 'disabled' } as const
            : cmsRecipient.normalized
              ? {
                  outcome: 'configured',
                  recipient: cmsRecipient.normalized,
                  source: 'settings',
                } as const
              : environmentRecipient.normalized
                ? {
                    outcome: 'configured',
                    recipient: environmentRecipient.normalized,
                    source: 'environment',
                  } as const
                : { outcome: 'not_configured' } as const

          const firstSelection = selectNotificationRecipient(input)
          const repeatedSelection = selectNotificationRecipient(input)

          expect(firstSelection).toEqual(expected)
          expect(repeatedSelection).toEqual(expected)
          expect(repeatedSelection).toEqual(firstSelection)
        },
      ),
      { numRuns: 200 },
    )
  })
})
