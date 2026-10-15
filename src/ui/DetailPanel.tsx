import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ATTACHMENTS } from '../data/weapon'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useArmoryStore } from '../state/useArmoryStore'
import type { AttachmentEffect, AttachmentInfo } from '../types/armory'
import { MOBILE_BREAKPOINT_PX } from './layout'

const POLARITY = {
  buff: { glyph: '+', className: 'text-buff' },
  nerf: { glyph: '−', className: 'text-nerf' },
  neutral: { glyph: '·', className: 'text-muted' },
} as const

const DISMISS_DRAG_PX = 90

function EffectList({ effects }: { effects: readonly AttachmentEffect[] }) {
  return (
    <ul className="space-y-1.5">
      {effects.map((effect) => {
        const p = POLARITY[effect.polarity]
        return (
          <li key={effect.label} className="flex gap-2 text-[15px] leading-snug">
            <span className={`w-3 shrink-0 font-mono font-bold ${p.className}`} aria-hidden>
              {p.glyph}
            </span>
            <span>{effect.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

function PanelBody({ info, onClose }: { info: AttachmentInfo; onClose: () => void }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="hud-label">
            {info.code} // {info.slot}
          </p>
          <h2 className="mt-1 text-3xl leading-none font-bold text-accent">{info.featured.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="-mr-1 -mt-1 p-2 font-mono text-xs tracking-widest text-muted transition-colors hover:text-accent"
        >
          ✕
        </button>
      </div>

      <p className="mt-3 text-[15px] leading-snug text-muted">{info.purpose}</p>

      <dl className="mt-4 grid grid-cols-3 gap-px border border-line bg-line">
        {info.stats.map((stat) => (
          <div key={stat.label} className="bg-void/90 px-2.5 py-2">
            <dt className="hud-label !text-[9px]">{stat.label}</dt>
            <dd className="mt-0.5 font-bold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-4">
        <h3 className="hud-label mb-2">Effects</h3>
        <EffectList effects={info.featured.effects} />
      </section>

      <section className="mt-4 border-l-2 border-accent/60 bg-accent/5 px-3 py-2">
        <h3 className="hud-label mb-1 !text-accent/80">Tactical note</h3>
        <p className="text-[15px] leading-snug">{info.tacticalNote}</p>
      </section>

      {info.alternatives.length > 0 && (
        <section className="mt-4">
          <h3 className="hud-label mb-2">Other options</h3>
          <ul className="space-y-2">
            {info.alternatives.map((alt) => (
              <li key={alt.name} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line pb-1.5">
                <span className="font-bold">{alt.name}</span>
                <span className="font-mono text-[11px] text-muted">
                  {alt.effects.map((e) => e.label).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

/** Right-hand panel on desktop, draggable bottom sheet on mobile. */
export function DetailPanel() {
  const selected = useArmoryStore((s) => s.selected)
  const resetView = useArmoryStore((s) => s.resetView)
  const mobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`)
  const info = selected ? ATTACHMENTS[selected] : null

  const onDragEnd = (_: unknown, drag: PanInfo) => {
    if (drag.offset.y > DISMISS_DRAG_PX || drag.velocity.y > 600) resetView()
  }

  return (
    <AnimatePresence mode="wait">
      {info &&
        (mobile ? (
          <motion.aside
            key={`sheet-${info.id}`}
            role="dialog"
            aria-label={`${info.slot} details`}
            className="hud-panel pointer-events-auto fixed inset-x-0 bottom-0 z-30 max-h-[58vh] overflow-y-auto px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            style={{ touchAction: 'pan-y' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-accent/40" aria-hidden />
            <PanelBody info={info} onClose={resetView} />
          </motion.aside>
        ) : (
          <motion.aside
            key={`panel-${info.id}`}
            role="dialog"
            aria-label={`${info.slot} details`}
            className="hud-panel pointer-events-auto fixed top-1/2 right-6 z-30 max-h-[80vh] w-[380px] -translate-y-1/2 overflow-y-auto p-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <PanelBody info={info} onClose={resetView} />
          </motion.aside>
        ))}
    </AnimatePresence>
  )
}
