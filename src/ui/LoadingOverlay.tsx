import { AnimatePresence, motion } from 'framer-motion'
import { useArmoryStore } from '../state/useArmoryStore'

/** Covers the canvas until the weapon is loaded and measured. */
export function LoadingOverlay() {
  const ready = useArmoryStore((s) => s.layout !== null)

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="font-mono text-[11px] tracking-[0.3em] text-accent/80">INITIALISING ARMORY</span>
          <span className="relative h-px w-40 overflow-hidden bg-line">
            <motion.span
              className="absolute inset-y-0 w-1/3 bg-accent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
