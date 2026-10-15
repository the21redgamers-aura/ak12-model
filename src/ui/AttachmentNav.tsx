import { ATTACHMENTS } from '../data/weapon'
import { useArmoryStore } from '../state/useArmoryStore'
import { ATTACHMENT_IDS } from '../types/armory'

/** Slot list: a vertical rail on desktop, a scrollable chip row on mobile. */
export function AttachmentNav() {
  const selected = useArmoryStore((s) => s.selected)
  const parts = useArmoryStore((s) => s.layout?.parts)
  const select = useArmoryStore((s) => s.select)
  const hover = useArmoryStore((s) => s.hover)
  const resetView = useArmoryStore((s) => s.resetView)

  return (
    <nav aria-label="Attachments" className="pointer-events-auto">
      <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {ATTACHMENT_IDS.map((id, index) => {
          const info = ATTACHMENTS[id]
          const available = Boolean(parts?.[id])
          const active = selected === id
          return (
            <li key={id} className="shrink-0">
              <button
                type="button"
                disabled={!available}
                onClick={() => select(id)}
                onPointerEnter={() => available && hover(id)}
                onPointerLeave={() => hover(null)}
                aria-pressed={active}
                title={available ? undefined : 'No mesh mapped for this attachment'}
                className={`hud-panel flex w-full items-center gap-3 px-3 py-2 text-left transition-colors md:w-56 ${
                  active ? 'border-accent/70 bg-accent/10' : 'hover:bg-accent/5'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <span className="font-mono text-[10px] text-accent/70">0{index + 1}</span>
                <span className="flex flex-col">
                  <span className="hud-label !tracking-[0.2em]">{info.slot}</span>
                  <span className={`text-base font-bold ${active ? 'text-accent' : 'text-ink'}`}>
                    {info.featured.name}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        <li className="shrink-0">
          <button
            type="button"
            onClick={resetView}
            className="hud-panel w-full px-3 py-2 text-left font-mono text-[10px] tracking-[0.25em] text-muted transition-colors hover:text-accent md:w-56"
          >
            RESET VIEW <span className="hidden md:inline">[ESC]</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
