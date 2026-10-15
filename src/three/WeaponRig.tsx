import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { Box3, Color, Mesh, MeshStandardMaterial, Vector3, type Group, type Material, type Object3D } from 'three'
import { MODEL_ROTATION, MODEL_TARGET_LENGTH } from '../config/modelConfig'
import { useArmoryStore, type FocusTarget } from '../state/useArmoryStore'
import type { AttachmentId } from '../types/armory'
import {
  buildOwnershipLookup,
  computeWorldBounds,
  findAttachmentForObject,
  listNamedNodes,
  resolveAttachmentNodes,
  type NodeMap,
} from './lib/attachmentNodes'

const HOVER_EMISSIVE = new Color('#2ee6d6')
const HOVER_INTENSITY = 0.18
const SELECTED_INTENSITY = 0.35

interface WeaponRigProps {
  readonly nodeMap: NodeMap
  readonly children: ReactNode
}

interface RigSetup {
  readonly lookup: ReadonlyMap<Object3D, AttachmentId>
  readonly highlight: ReadonlyMap<AttachmentId, readonly MeshStandardMaterial[]>
}

/**
 * Normalises any weapon (GLB or placeholder) to a common scale and origin,
 * resolves its attachment nodes, publishes the layout for hotspots and the
 * camera, and turns raycast hits into store updates.
 */
export function WeaponRig({ nodeMap, children }: WeaponRigProps) {
  const outer = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const setupRef = useRef<RigSetup | null>(null)
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)

  const { select, hover, setLayout, setNodeReport } = useArmoryStore.getState()
  const selected = useArmoryStore((s) => s.selected)
  const hovered = useArmoryStore((s) => s.hovered)
  const rotation = useMemo(() => [...MODEL_ROTATION] as [number, number, number], [])

  useLayoutEffect(() => {
    const outerGroup = outer.current
    const innerGroup = inner.current
    if (!outerGroup || !innerGroup) return

    // 1. Normalise: longest axis = MODEL_TARGET_LENGTH, centred on the origin.
    outerGroup.position.set(0, 0, 0)
    outerGroup.scale.setScalar(1)
    outerGroup.updateWorldMatrix(true, true)
    const raw = new Box3().setFromObject(innerGroup)
    const size = raw.getSize(new Vector3())
    const scale = MODEL_TARGET_LENGTH / Math.max(size.x, size.y, size.z, 1e-6)
    const center = raw.getCenter(new Vector3())
    outerGroup.scale.setScalar(scale)
    outerGroup.position.copy(center).multiplyScalar(-scale)
    outerGroup.updateWorldMatrix(true, true)

    // 2. Resolve attachment nodes and report anything missing.
    const { nodes, missing } = resolveAttachmentNodes(innerGroup, nodeMap)
    setNodeReport({ missing, availableNodes: listNamedNodes(innerGroup) })

    // 3. Measure each attachment for hotspot placement and camera framing.
    const parts: Partial<Record<AttachmentId, FocusTarget>> = {}
    for (const [id, objects] of nodes) {
      const box = computeWorldBounds(objects)
      const c = box.getCenter(new Vector3())
      parts[id] = {
        center: [c.x, c.y, c.z],
        radius: Math.max(box.getSize(new Vector3()).length() / 2, 0.08),
      }
    }
    const worldBox = new Box3().setFromObject(outerGroup)
    setLayout({ parts, groundY: worldBox.min.y })

    // 4. Give each attachment its own material instances so highlighting one
    //    part never bleeds onto meshes that shared the original material.
    const highlight = new Map<AttachmentId, MeshStandardMaterial[]>()
    const originals: [Mesh, Material | Material[]][] = []
    for (const [id, objects] of nodes) {
      const list: MeshStandardMaterial[] = []
      for (const object of objects) {
        object.traverse((child) => {
          if (!(child instanceof Mesh) || Array.isArray(child.material)) return
          if (!(child.material instanceof MeshStandardMaterial)) return
          originals.push([child, child.material])
          child.material = child.material.clone()
          list.push(child.material)
        })
      }
      highlight.set(id, list)
    }

    setupRef.current = { lookup: buildOwnershipLookup(nodes), highlight }
    invalidate()

    return () => {
      for (const [mesh, material] of originals) {
        const clone = mesh.material
        mesh.material = material
        if (!Array.isArray(clone)) clone.dispose()
      }
      setupRef.current = null
    }
  }, [nodeMap, invalidate, setLayout, setNodeReport])

  // Emissive tint for hovered/selected parts.
  useEffect(() => {
    const setup = setupRef.current
    if (!setup) return
    for (const [id, materials] of setup.highlight) {
      const intensity = id === selected ? SELECTED_INTENSITY : id === hovered ? HOVER_INTENSITY : 0
      for (const material of materials) {
        material.emissive.copy(HOVER_EMISSIVE)
        material.emissiveIntensity = intensity
      }
    }
    invalidate()
  }, [selected, hovered, invalidate])

  // Always restore the cursor if the rig unmounts mid-hover.
  useEffect(() => () => void (gl.domElement.style.cursor = ''), [gl])

  const resolve = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    const lookup = setupRef.current?.lookup
    return lookup ? findAttachmentForObject(event.object, lookup) : null
  }

  return (
    <group
      ref={outer}
      onPointerMove={(e) => {
        e.stopPropagation()
        const id = resolve(e)
        if (useArmoryStore.getState().hovered !== id) hover(id)
        gl.domElement.style.cursor = id ? 'pointer' : ''
      }}
      onPointerOut={() => {
        hover(null)
        gl.domElement.style.cursor = ''
      }}
      onClick={(e) => {
        // Ignore the click that ends an orbit drag.
        if (e.delta > 4) return
        const id = resolve(e)
        if (id) {
          e.stopPropagation()
          select(id)
        }
      }}
    >
      <group ref={inner} rotation={rotation}>
        {children}
      </group>
    </group>
  )
}
