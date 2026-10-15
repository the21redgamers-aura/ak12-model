/// <reference types="vitest/config" />
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))
const SOURCE_MODEL = resolve(root, 'ak12.glb')
const PUBLIC_MODEL = resolve(root, 'public/models/ak12.glb')

/**
 * The brief places `ak12.glb` in the repository root. Vite only serves static
 * files from `public/`, so mirror it there on every dev/build start. The copy
 * is git-ignored; the root file stays the single source of truth.
 */
function syncModel(): Plugin {
  return {
    name: 'ak12:sync-model',
    buildStart() {
      if (!existsSync(SOURCE_MODEL)) return
      const stale =
        !existsSync(PUBLIC_MODEL) ||
        statSync(PUBLIC_MODEL).mtimeMs < statSync(SOURCE_MODEL).mtimeMs
      if (stale) {
        mkdirSync(dirname(PUBLIC_MODEL), { recursive: true })
        copyFileSync(SOURCE_MODEL, PUBLIC_MODEL)
      }
    },
  }
}

const modelAvailable = existsSync(SOURCE_MODEL) || existsSync(PUBLIC_MODEL)

export default defineConfig({
  plugins: [syncModel(), react(), tailwindcss()],
  define: {
    __AK12_MODEL_AVAILABLE__: JSON.stringify(modelAvailable),
  },
  build: {
    // three.js alone is ~700 kB minified; it is isolated in a lazy chunk.
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
