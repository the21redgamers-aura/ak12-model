export const ATTACHMENT_IDS = ['optic', 'barrel', 'underbarrel', 'magazine'] as const

export type AttachmentId = (typeof ATTACHMENT_IDS)[number]

export type Vec3 = readonly [number, number, number]

/** A single in-game effect line. `polarity` drives the +/- styling. */
export interface AttachmentEffect {
  readonly label: string
  readonly polarity: 'buff' | 'nerf' | 'neutral'
}

export interface AttachmentOption {
  readonly name: string
  readonly effects: readonly AttachmentEffect[]
}

export interface StatLine {
  readonly label: string
  readonly value: string
}

export interface AttachmentInfo {
  readonly id: AttachmentId
  /** Slot name as shown in Siege's loadout screen. */
  readonly slot: string
  /** Short code rendered on the hotspot marker. */
  readonly code: string
  /** The attachment this breakdown spotlights. */
  readonly featured: AttachmentOption
  /** Other picks for this slot on the AK-12. */
  readonly alternatives: readonly AttachmentOption[]
  readonly purpose: string
  readonly tacticalNote: string
  readonly stats: readonly StatLine[]
  /**
   * Direction (in model space, not normalised) the camera looks *from* when
   * focusing this attachment. Distance is derived from the part's bounds.
   */
  readonly viewDirection: Vec3
}

export interface WeaponInfo {
  readonly name: string
  readonly class: string
  readonly operators: readonly string[]
  readonly stats: readonly StatLine[]
  readonly patchNote: string
}
