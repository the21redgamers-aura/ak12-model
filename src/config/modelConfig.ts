import type { AttachmentId, Vec3 } from '../types/armory'

export const MODEL_URL = '/models/ak12.glb'

/** The weapon is rescaled so its longest axis spans this many world units. */
export const MODEL_TARGET_LENGTH = 4

/**
 * Applied before normalisation. The scene expects the muzzle along +X and the
 * top of the receiver along +Y; adjust this if the exported file is oriented
 * differently (e.g. `[0, Math.PI / 2, 0]` for a muzzle pointing along -Z).
 */
export const MODEL_ROTATION: Vec3 = [0, 0, 0]

/**
 * Node names inside `ak12.glb` that make up each attachment.
 *
 * Intentionally empty: the model was not available when this was written and
 * names must come from the real file, not guesses. Run `npm run inspect:model`
 * to list every node in the GLB, then fill these in. Any attachment left
 * unmatched is reported in the UI and by the inspector.
 *
 * Several names may be listed per attachment (e.g. a scope body and its lens).
 */
export const GLB_NODE_MAP: Record<AttachmentId, readonly string[]> = {
  optic: [],
  barrel: [],
  underbarrel: [],
  magazine: [],
}

/** Node names used by the built-in placeholder rifle. */
export const PLACEHOLDER_NODE_MAP: Record<AttachmentId, readonly string[]> = {
  optic: ['placeholder_optic'],
  barrel: ['placeholder_barrel'],
  underbarrel: ['placeholder_grip'],
  magazine: ['placeholder_magazine'],
}
