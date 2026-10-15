import { create } from 'zustand'
import type { AttachmentId, Vec3 } from '../types/armory'

export type ModelSource = 'glb' | 'placeholder'

export interface NodeReport {
  /** Attachments whose configured node names were not found in the scene. */
  readonly missing: readonly AttachmentId[]
  /** Every named node in the loaded scene, for diagnosing the mapping. */
  readonly availableNodes: readonly string[]
}

/** World-space framing for one attachment, derived from its mesh bounds. */
export interface FocusTarget {
  readonly center: Vec3
  readonly radius: number
}

/** Measured once the weapon is normalised; drives hotspots and the camera. */
export interface SceneLayout {
  readonly parts: Partial<Record<AttachmentId, FocusTarget>>
  /** Y of the lowest point of the weapon, where contact shadows sit. */
  readonly groundY: number
}

interface ArmoryState {
  selected: AttachmentId | null
  hovered: AttachmentId | null
  /** Bumped whenever the user asks to re-frame the whole weapon. */
  overviewRequest: number
  modelSource: ModelSource
  nodeReport: NodeReport | null
  layout: SceneLayout | null
  loadError: string | null

  select: (id: AttachmentId | null) => void
  hover: (id: AttachmentId | null) => void
  resetView: () => void
  setNodeReport: (report: NodeReport) => void
  setLayout: (layout: SceneLayout) => void
  /** Called when ak12.glb fails to load; switches to the placeholder rifle. */
  failModelLoad: (message: string) => void
}

export const useArmoryStore = create<ArmoryState>()((set) => ({
  selected: null,
  hovered: null,
  overviewRequest: 0,
  modelSource: __AK12_MODEL_AVAILABLE__ ? 'glb' : 'placeholder',
  nodeReport: null,
  layout: null,
  loadError: null,

  select: (id) => set({ selected: id }),
  hover: (id) => set({ hovered: id }),
  resetView: () => set((s) => ({ selected: null, overviewRequest: s.overviewRequest + 1 })),
  setNodeReport: (nodeReport) => set({ nodeReport }),
  setLayout: (layout) => set({ layout }),
  failModelLoad: (loadError) =>
    set({ loadError, modelSource: 'placeholder', selected: null, layout: null, nodeReport: null }),
}))
