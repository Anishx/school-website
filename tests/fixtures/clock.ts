export type Clock = Readonly<{ now: () => Date }>

export class FakeClock implements Clock {
  readonly #minimumTime = Date.parse('2000-01-01T00:00:00.000Z')
  #milliseconds: number

  constructor(initialTime: string | Date = '2030-01-15T10:00:00.000Z') {
    this.#milliseconds = this.parse(initialTime)
  }

  now(): Date {
    return new Date(this.#milliseconds)
  }

  iso(): string {
    return this.now().toISOString()
  }

  set(value: string | Date): void {
    this.#milliseconds = this.parse(value)
  }

  advance(milliseconds: number): void {
    if (!Number.isFinite(milliseconds)) throw new Error('Fake clock advance must be finite')
    const next = this.#milliseconds + milliseconds
    if (next < this.#minimumTime) throw new Error('Fake clock cannot move before its test epoch')
    this.#milliseconds = next
  }

  private parse(value: string | Date): number {
    const milliseconds = value instanceof Date ? value.valueOf() : Date.parse(value)
    if (!Number.isFinite(milliseconds)) throw new Error('Fake clock requires a valid time')
    return milliseconds
  }
}

export function createFakeClock(initialTime?: string | Date): FakeClock {
  return new FakeClock(initialTime)
}
