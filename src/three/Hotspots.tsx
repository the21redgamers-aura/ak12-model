import { Html } from '@react-three/drei'
import { ATTACHMENTS } from '../data/weapon'
import { useArmoryStore } from '../state/useArmoryStore'
import { ATTACHMENT_IDS } from '../types/armory'
import { HotspotMarker } from '../ui/HotspotMarker'

/** Anchors a DOM marker to the measured centre of every resolved attachment. */
export function Hotspots() {
  const parts = useArmoryStore((s) => s.layout?.parts)
  const selected = useArmoryStore((s) => s.selected)
  const hovered = useArmoryStore((s) => s.hovered)
  const select = useArmoryStore((s) => s.select)
  const hover = useArmoryStore((s) => s.hover)

  if (!parts) return null

  return ATTACHMENT_IDS.map((id) => {
    const part = parts[id]
    if (!part) return null
    return (
      <Html key={id} position={part.center} center zIndexRange={[20, 10]}>
        <HotspotMarker
          info={ATTACHMENTS[id]}
          active={selected === id}
          highlighted={hovered === id}
          onSelect={() => select(id)}
          onHover={(on) => hover(on ? id : null)}
        />
      </Html>
    )
  })
}
