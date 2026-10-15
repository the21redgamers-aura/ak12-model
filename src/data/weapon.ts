import type { AttachmentId, AttachmentInfo, WeaponInfo } from '../types/armory'

/**
 * Siege rebalances weapons most seasons. Base numbers below are the long-
 * standing AK-12 values; re-check them against the current patch notes
 * before publishing. Attachment effects mirror the in-game descriptions
 * rather than invented percentages.
 */
export const WEAPON: WeaponInfo = {
  name: 'AK-12',
  class: 'Assault Rifle',
  operators: ['Fuze', 'Ace'],
  stats: [
    { label: 'Damage', value: '45' },
    { label: 'Fire rate', value: '850 RPM' },
    { label: 'Capacity', value: '30 + 1' },
    { label: 'Fire modes', value: 'Auto / Single' },
  ],
  patchNote: 'Values reflect long-standing live values; verify against the current season.',
}

export const ATTACHMENTS: Record<AttachmentId, AttachmentInfo> = {
  optic: {
    id: 'optic',
    slot: 'Sight',
    code: 'OPT',
    featured: {
      name: '2.5x ACOG',
      effects: [
        { label: 'Magnified sight picture for long angles', polarity: 'buff' },
        { label: 'Slower aim-down-sights transition', polarity: 'nerf' },
        { label: 'Recoil reads larger through the glass', polarity: 'nerf' },
      ],
    },
    alternatives: [
      { name: 'Red Dot', effects: [{ label: '1.0x, clean reticle', polarity: 'neutral' }] },
      { name: 'Holographic', effects: [{ label: '1.0x, wide ring reticle', polarity: 'neutral' }] },
      { name: 'Reflex', effects: [{ label: '1.0x, compact frame', polarity: 'neutral' }] },
      { name: 'Magnified 1.5x', effects: [{ label: 'Light zoom, minimal ADS cost', polarity: 'buff' }] },
    ],
    purpose: 'Sets how far you can reliably take a fight and how quickly you get on target.',
    tacticalNote:
      'Take magnification for long hallways and exterior holds; drop to 1.0x when your role is clearing tight rooms.',
    stats: [
      { label: 'Zoom', value: '2.5x' },
      { label: 'Best range', value: 'Mid / long' },
      { label: 'ADS speed', value: 'Slower' },
    ],
    viewDirection: [-0.6, 0.9, 1],
  },
  barrel: {
    id: 'barrel',
    slot: 'Barrel',
    code: 'BRL',
    featured: {
      name: 'Flash Hider',
      effects: [
        { label: 'Reduces vertical recoil', polarity: 'buff' },
        { label: 'Hides muzzle flash from your own view', polarity: 'buff' },
      ],
    },
    alternatives: [
      { name: 'Compensator', effects: [{ label: 'Reduces horizontal recoil', polarity: 'buff' }] },
      { name: 'Muzzle Brake', effects: [{ label: 'Reduces first-shot recoil', polarity: 'buff' }] },
      {
        name: 'Suppressor',
        effects: [
          { label: 'Hides your position on the minimap', polarity: 'buff' },
          { label: 'Removes muzzle flash', polarity: 'buff' },
        ],
      },
    ],
    purpose: 'Shapes the recoil pattern by trading control between axes.',
    tacticalNote:
      'The AK-12 climbs hard on full auto. Flash Hider is the default pick for spraying; Muzzle Brake suits tap-firing.',
    stats: [
      { label: 'Recoil axis', value: 'Vertical' },
      { label: 'Concealment', value: 'Flash only' },
      { label: 'Best style', value: 'Spray' },
    ],
    viewDirection: [0.2, 0.25, 1],
  },
  underbarrel: {
    id: 'underbarrel',
    slot: 'Grip',
    code: 'GRP',
    featured: {
      name: 'Vertical Grip',
      effects: [
        { label: 'Reduces vertical recoil', polarity: 'buff' },
        { label: 'Stacks with a Flash Hider for full-auto control', polarity: 'buff' },
      ],
    },
    alternatives: [
      { name: 'Angled Grip', effects: [{ label: 'Faster aim-down-sights', polarity: 'buff' }] },
      { name: 'Laser', effects: [{ label: 'Tighter hip-fire spread, visible beam', polarity: 'neutral' }] },
    ],
    purpose: 'Your second recoil lever, or a speed lever if you prefer peeking first.',
    tacticalNote:
      'Vertical Grip for anchoring and holding angles; Angled Grip when you are the one swinging onto defenders.',
    stats: [
      { label: 'Recoil axis', value: 'Vertical' },
      { label: 'ADS speed', value: 'Unchanged' },
      { label: 'Best role', value: 'Anchor' },
    ],
    viewDirection: [0.3, -0.5, 1],
  },
  magazine: {
    id: 'magazine',
    slot: 'Receiver / Magazine',
    code: 'MAG',
    featured: {
      name: 'Standard 30-round',
      effects: [
        { label: '30 + 1 with a round chambered', polarity: 'neutral' },
        { label: 'Tactical reload keeps the chambered round', polarity: 'buff' },
        { label: 'Empty reload is noticeably slower', polarity: 'nerf' },
      ],
    },
    alternatives: [],
    purpose: 'Not a swappable attachment in Siege; it defines the rifle’s staying power between reloads.',
    tacticalNote:
      'At 850 RPM a full mag empties in roughly two seconds. Reload before you peek, not after.',
    stats: [
      { label: 'Capacity', value: '30 + 1' },
      { label: 'Time to empty', value: '≈ 2.1 s' },
      { label: 'Caliber', value: '5.45×39mm' },
    ],
    viewDirection: [0.4, -0.2, 1],
  },
}
