import { Box3, PropertyBinding, type Object3D } from 'three'
import { ATTACHMENT_IDS, type AttachmentId } from '../../types/armory'

export type NodeMap = Record<AttachmentId, readonly string[]>

export interface ResolvedAttachments {
  readonly nodes: ReadonlyMap<AttachmentId, readonly Object3D[]>
  readonly missing: readonly AttachmentId[]
}

/**
 * Looks up the configured node names in a loaded scene. Matching is exact
 * after GLTFLoader's own name sanitising (spaces become underscores, `.`,
 * `:`, `/`, `[` and `]` are stripped), so names can be copied straight from
 * Blender or from `npm run inspect:model`.
 *
 * An attachment counts as missing unless *every* configured name resolves:
 * a partial match would put the hotspot and camera focus in the wrong place.
 */
export function resolveAttachmentNodes(root: Object3D, map: NodeMap): ResolvedAttachments {
  const nodes = new Map<AttachmentId, Object3D[]>()
  const missing: AttachmentId[] = []

  for (const id of ATTACHMENT_IDS) {
    const names = map[id]
    const found = names
      .map((name) => root.getObjectByName(PropertyBinding.sanitizeNodeName(name)))
      .filter((node): node is Object3D => node !== undefined)

    if (names.length === 0 || found.length !== names.length) missing.push(id)
    else nodes.set(id, found)
  }

  return { nodes, missing }
}

/** Maps every object under each attachment node (inclusive) to its attachment. */
export function buildOwnershipLookup(
  nodes: ReadonlyMap<AttachmentId, readonly Object3D[]>,
): ReadonlyMap<Object3D, AttachmentId> {
  const lookup = new Map<Object3D, AttachmentId>()
  for (const [id, roots] of nodes) {
    for (const node of roots) node.traverse((child) => lookup.set(child, id))
  }
  return lookup
}

/**
 * Resolves a raycast hit to the attachment that owns it, walking up the
 * parent chain so hits on nested sub-meshes (screws, lenses) still count.
 */
export function findAttachmentForObject(
  object: Object3D | null,
  lookup: ReadonlyMap<Object3D, AttachmentId>,
): AttachmentId | null {
  for (let current = object; current; current = current.parent) {
    const id = lookup.get(current)
    if (id) return id
  }
  return null
}

/** World-space bounds of a set of nodes. Call after world matrices are current. */
export function computeWorldBounds(objects: readonly Object3D[]): Box3 {
  const box = new Box3()
  for (const object of objects) box.expandByObject(object)
  return box
}

/** Every named node in the scene, in traversal order, for diagnostics. */
export function listNamedNodes(root: Object3D): string[] {
  const names: string[] = []
  root.traverse((node) => {
    if (node !== root && node.name) names.push(node.name)
  })
  return names
}
