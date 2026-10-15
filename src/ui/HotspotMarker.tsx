import type { AttachmentInfo } from '../types/armory'

interface HotspotMarkerProps {
  readonly info: AttachmentInfo
  readonly active: boolean
  readonly highlighted: boolean
  readonly onSelect: () => void
  readonly onHover: (hovering: boolean) => void
}

export function HotspotMarker({ info, active, highlighted, onSelect, onHover }: HotspotMarkerProps) {
  const lit = active || highlighted
  return (
    <button
      type="button"
      onClick={onSelect}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      aria-label={`Inspect ${info.slot}: ${info.featured.name}`}
      aria-pressed={active}
      className="group relative flex size-11 cursor-pointer items-center justify-center"
      style={{ touchAction: 'manipulation' }}
    >
      {!active && (
        <span className="absolute size-5 rounded-full border border-accent/60 animate-ping-slow" aria-hidden />
      )}
      <span
        aria-hidden
        className={`relative flex size-5 items-center justify-center rotate-45 border transition-all duration-200 ${
          lit ? 'scale-110 border-accent bg-accent/25' : 'border-accent/70 bg-void/70'
        }`}
      >
        <span className={`size-1.5 ${active ? 'bg-accent' : 'bg-accent/80'}`} />
      </span>
      <span
        className={`pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap border border-line bg-void/80 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] transition-opacity duration-200 ${
          lit ? 'text-accent opacity-100' : 'text-muted opacity-0 group-hover:opacity-100 md:opacity-70'
        }`}
      >
        {info.code}
      </span>
    </button>
  )
}
