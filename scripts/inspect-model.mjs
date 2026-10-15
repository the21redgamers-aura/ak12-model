#!/usr/bin/env node
/**
 * Lists every node in ak12.glb as three.js will name it, and checks the
 * attachment mapping in src/config/modelConfig.ts against it.
 *
 *   npm run inspect:model            report only
 *   npm run inspect:model -- --strict exit 1 if any attachment is unmapped
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { PropertyBinding } from 'three'
import { GLB_NODE_MAP } from '../src/config/modelConfig.ts'

const KEYWORDS = {
  optic: ['optic', 'scope', 'sight', 'acog', 'reflex', 'holo', 'reddot'],
  barrel: ['barrel', 'muzzle', 'flash', 'comp', 'brake', 'suppress', 'silenc'],
  underbarrel: ['grip', 'underbarrel', 'foregrip', 'vertical', 'angled', 'laser'],
  magazine: ['mag', 'clip', 'ammo', 'receiver'],
}

const strict = process.argv.includes('--strict')
const path = [resolve('ak12.glb'), resolve('public/models/ak12.glb')].find((p) => existsSync(p))

if (!path) {
  console.error('ak12.glb not found in the repository root or public/models/.')
  process.exit(1)
}

const document = await new NodeIO().read(path)
const root = document.getRoot()

// Mirror GLTFLoader: sanitise, then suffix repeats with _1, _2, ...
const seen = new Map()
const threeName = (raw) => {
  const base = PropertyBinding.sanitizeNodeName(raw || '')
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)
  return count === 0 ? base : `${base}_${count}`
}

const rows = []
const visit = (node, depth) => {
  const mesh = node.getMesh()
  const triangles = mesh
    ? mesh.listPrimitives().reduce((sum, p) => {
        const indices = p.getIndices()
        const count = indices ? indices.getCount() : (p.getAttribute('POSITION')?.getCount() ?? 0)
        return sum + Math.floor(count / 3)
      }, 0)
    : 0
  rows.push({ name: threeName(node.getName()), raw: node.getName(), depth, mesh: mesh?.getName(), triangles })
  for (const child of node.listChildren()) visit(child, depth + 1)
}
for (const scene of root.listScenes()) for (const node of scene.listChildren()) visit(node, 0)

console.log(`\n${path}`)
console.log(
  `${rows.length} nodes · ${root.listMeshes().length} meshes · ${root.listMaterials().length} materials · ${root.listTextures().length} textures\n`,
)
for (const row of rows) {
  const renamed = row.raw && row.raw !== row.name ? `  (raw: "${row.raw}")` : ''
  const mesh = row.mesh !== undefined ? `  [mesh ${row.triangles.toLocaleString()} tris]` : ''
  console.log(`${'  '.repeat(row.depth)}${row.name || '(unnamed)'}${mesh}${renamed}`)
}

const names = new Set(rows.map((r) => r.name))
let unmapped = 0
console.log('\nAttachment mapping (src/config/modelConfig.ts → GLB_NODE_MAP)')
for (const [id, configured] of Object.entries(GLB_NODE_MAP)) {
  const resolved = configured.map((n) => PropertyBinding.sanitizeNodeName(n))
  const missing = resolved.filter((n) => !names.has(n))
  if (configured.length === 0 || missing.length > 0) unmapped++

  if (configured.length === 0) console.log(`  ✗ ${id}: not configured`)
  else if (missing.length > 0) console.log(`  ✗ ${id}: missing ${missing.map((n) => `"${n}"`).join(', ')}`)
  else console.log(`  ✓ ${id}: ${resolved.join(', ')}`)

  if (configured.length === 0 || missing.length > 0) {
    const candidates = rows
      .map((r) => r.name)
      .filter((n) => KEYWORDS[id].some((k) => n.toLowerCase().includes(k)))
    if (candidates.length > 0) {
      console.log(`      name matches to review by hand (unverified): ${candidates.slice(0, 8).join(', ')}`)
    } else {
      console.log('      no node names match common keywords; this part may be merged into another mesh')
    }
  }
}

if (unmapped > 0) {
  console.log(`\n${unmapped} attachment(s) unmapped. They will show as missing in the UI.`)
  if (strict) process.exit(1)
} else {
  console.log('\nAll attachments mapped.')
}
