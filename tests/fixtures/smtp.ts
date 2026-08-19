import { assertSyntheticRecipient, SYNTHETIC_RECIPIENTS } from './sentinels'

export type SyntheticMail = Readonly<{
  from?: string
  to: string | readonly string[]
  subject: string
  text?: string
  html?: string
}>

export type SyntheticDelivery = Readonly<{
  messageId: string
  envelope: Readonly<{ from: string; to: readonly string[] }>
  message: SyntheticMail
}>

export type MockSmtpTransportOptions = Readonly<{
  failWith?: Error
}>

function recipients(value: string | readonly string[]): string[] {
  const values = typeof value === 'string' ? [value] : [...value]
  if (values.length === 0) throw new Error('Fixture email requires a recipient')
  values.forEach(assertSyntheticRecipient)
  return values
}

export class MockSmtpTransport {
  readonly #deliveries: SyntheticDelivery[] = []
  #failure: Error | undefined

  constructor(options: MockSmtpTransportOptions = {}) {
    this.#failure = options.failWith
  }

  get deliveries(): readonly SyntheticDelivery[] {
    return this.#deliveries.map((delivery) => ({
      ...delivery,
      envelope: { ...delivery.envelope, to: [...delivery.envelope.to] },
      message: { ...delivery.message },
    }))
  }

  failWith(error: Error | undefined): void {
    this.#failure = error
  }
  async sendMail(message: SyntheticMail): Promise<SyntheticDelivery> {
    const to = recipients(message.to)
    const from = message.from ?? SYNTHETIC_RECIPIENTS.sender
    assertSyntheticRecipient(from)
    if (this.#failure) throw this.#failure

    const delivery: SyntheticDelivery = {
      messageId: `mock-smtp-${String(this.#deliveries.length + 1).padStart(4, '0')}`,
      envelope: { from, to },
      message: { ...message, from, to: [...to] },
    }
    this.#deliveries.push(delivery)
    return delivery
  }

  clear(): void {
    this.#deliveries.length = 0
  }
}

export function createMockSmtpTransport(
  options?: MockSmtpTransportOptions,
): MockSmtpTransport {
  return new MockSmtpTransport(options)
}
