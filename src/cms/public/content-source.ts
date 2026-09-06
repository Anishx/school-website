import type { ContentSource } from './dto'

export function contentForSource<T>(
  source: ContentSource,
  legacy: readonly T[],
  managed: readonly T[],
  key: (item: T) => string,
): T[] {
  if (source === 'legacy') return [...legacy]
  if (source === 'managed') return [...managed]

  const combined = new Map(legacy.map((item) => [key(item), item]))
  for (const item of managed) combined.set(key(item), item)
  return [...combined.values()]
}
