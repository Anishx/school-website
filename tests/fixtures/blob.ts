export type FakeBlobPutOptions = Readonly<{ contentType?: string }>

export type FakeBlobRecord = Readonly<{
  url: string
  downloadUrl: string
  pathname: string
  contentType: string
  size: number
  uploadedAt: Date
}>

type StoredBlob = FakeBlobRecord & Readonly<{ bytes: Uint8Array }>

function safePathname(pathname: string): string {
  const normalized = pathname.replace(/\\/g, '/')
  if (!normalized.startsWith('test-fixtures/') || normalized.includes('..') || normalized.includes('://')) {
    throw new Error('Fake Blob writes are restricted to the test-fixtures/ namespace')
  }
  return normalized
}

function publicRecord(blob: StoredBlob): FakeBlobRecord {
  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: blob.size,
    uploadedAt: new Date(blob.uploadedAt),
  }
}

export class FakeBlobAdapter {
  readonly #objects = new Map<string, StoredBlob>()

  async put(
    pathname: string,
    bytes: Uint8Array,
    options: FakeBlobPutOptions = {},
  ): Promise<FakeBlobRecord> {
    const safePath = safePathname(pathname)
    const encodedPath = safePath.split('/').map(encodeURIComponent).join('/')
    const url = `https://blob.invalid/${encodedPath}`
    const blob: StoredBlob = {
      url, downloadUrl: `${url}?download=1`, pathname: safePath,
      contentType: options.contentType ?? 'application/octet-stream',
      size: bytes.byteLength, uploadedAt: new Date('2030-01-15T10:00:00.000Z'),
      bytes: Uint8Array.from(bytes),
    }
    this.#objects.set(safePath, blob)
    return publicRecord(blob)
  }
  async get(pathname: string): Promise<Uint8Array | undefined> {
    const blob = this.#objects.get(safePathname(pathname))
    return blob ? Uint8Array.from(blob.bytes) : undefined
  }

  async head(pathname: string): Promise<FakeBlobRecord | undefined> {
    const blob = this.#objects.get(safePathname(pathname))
    return blob ? publicRecord(blob) : undefined
  }

  async del(pathname: string): Promise<void> {
    this.#objects.delete(safePathname(pathname))
  }

  async delete(pathname: string): Promise<void> {
    await this.del(pathname)
  }

  async list(): Promise<readonly FakeBlobRecord[]> {
    return [...this.#objects.values()]
      .sort((left, right) => left.pathname.localeCompare(right.pathname))
      .map(publicRecord)
  }

  clear(): void {
    this.#objects.clear()
  }
}

export function createFakeBlobAdapter(): FakeBlobAdapter {
  return new FakeBlobAdapter()
}
