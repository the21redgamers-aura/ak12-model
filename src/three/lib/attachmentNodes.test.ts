import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Raycaster, Vector3, type Object3D } from 'three'
import { beforeEach, describe, expect, it } from 'vitest'
import { PLACEHOLDER_NODE_MAP } from '../../config/modelConfig'
import { useArmoryStore } from '../../state/useArmoryStore'
import {
  buildOwnershipLookup,
  findAttachmentForObject,
  resolveAttachmentNodes,
  type NodeMap,
} from './attachmentNodes'

function box(name: string, x: number): Mesh {
  const mesh = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshStandardMaterial())
  mesh.name = name
  mesh.position.x = x
  return mesh
}

/** A tiny rifle: each attachment is a group with a nested child mesh. */
function buildRifle(): Group {
  const root = new Group()
  for (const [i, name] of ['placeholder_optic', 'placeholder_barrel', 'placeholder_grip', 'placeholder_magazine'].entries()) {
    const group = new Group()
    group.name = name
    group.add(box(`${name}_part`, i * 2))
    root.add(group)
  }
  root.add(box('receiver', -3))
  root.updateMatrixWorld(true)
  return root
}

describe('resolveAttachmentNodes', () => {
  it('resolves every attachment present in the scene', () => {
    const { nodes, missing } = resolveAttachmentNodes(buildRifle(), PLACEHOLDER_NODE_MAP)
    expect(missing).toEqual([])
    expect(nodes.get('optic')?.[0]?.name).toBe('placeholder_optic')
  })

  it('reports unconfigured and unmatched attachments instead of guessing', () => {
    const map: NodeMap = {
      optic: ['placeholder_optic'],
      barrel: ['does_not_exist'],
      underbarrel: [],
      magazine: ['placeholder_magazine', 'also_missing'],
    }
    const { nodes, missing } = resolveAttachmentNodes(buildRifle(), map)
    expect(missing).toEqual(['barrel', 'underbarrel', 'magazine'])
    expect([...nodes.keys()]).toEqual(['optic'])
  })

  it('applies GLTFLoader name sanitising to configured names', () => {
    const root = new Group()
    const node = new Group()
    node.name = 'ACOG_Scope' // what GLTFLoader produces for "ACOG Scope"
    root.add(node)
    const map: NodeMap = { optic: ['ACOG Scope'], barrel: [], underbarrel: [], magazine: [] }
    expect(resolveAttachmentNodes(root, map).nodes.get('optic')?.[0]).toBe(node)
  })
})

describe('raycast → attachment → UI state', () => {
  beforeEach(() => useArmoryStore.setState({ selected: null, hovered: null }))

  it('maps a nested mesh hit to its attachment', () => {
    const rifle = buildRifle()
    const { nodes } = resolveAttachmentNodes(rifle, PLACEHOLDER_NODE_MAP)
    const lookup = buildOwnershipLookup(nodes)
    const nested = rifle.getObjectByName('placeholder_grip_part') as Object3D
    expect(findAttachmentForObject(nested, lookup)).toBe('underbarrel')
    expect(findAttachmentForObject(rifle.getObjectByName('receiver') ?? null, lookup)).toBeNull()
  })

  it('updates the selected attachment when a ray intersects its mesh', () => {
    const rifle = buildRifle()
    const lookup = buildOwnershipLookup(resolveAttachmentNodes(rifle, PLACEHOLDER_NODE_MAP).nodes)

    // Fire a real ray straight down the Z axis at the barrel (x = 2).
    const raycaster = new Raycaster(new Vector3(2, 0, 5), new Vector3(0, 0, -1))
    const [hit] = raycaster.intersectObject(rifle, true)
    expect(hit?.object.name).toBe('placeholder_barrel_part')

    // Same path WeaponRig's onClick takes.
    const id = findAttachmentForObject(hit?.object ?? null, lookup)
    if (id) useArmoryStore.getState().select(id)
    expect(useArmoryStore.getState().selected).toBe('barrel')

    useArmoryStore.getState().resetView()
    expect(useArmoryStore.getState().selected).toBeNull()
  })
})
