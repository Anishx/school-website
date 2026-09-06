import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Vercel's injected Next.js adapter emits a function per route. Let the
// established builder package the output and group routes for the Hobby plan.
// Keep this workaround until adapter builds also fit the 12-function limit.
const env = { ...process.env, NEXT_ADAPTER_PATH: '' }
console.log('Building for Vercel Hobby with shared Next.js function bundles.')
const result = spawnSync(process.execPath, [
  fileURLToPath(import.meta.resolve('next/dist/bin/next')),
  'build',
], { env, stdio: 'inherit' })

if (result.error) throw result.error
process.exit(result.status ?? 1)
