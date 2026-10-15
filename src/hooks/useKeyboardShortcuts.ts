import { useEffect } from 'react'
import { useArmoryStore } from '../state/useArmoryStore'
import { ATTACHMENT_IDS } from '../types/armory'

/** Esc returns to the overview; 1-4 jump to an attachment. */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const { resetView, select, layout } = useArmoryStore.getState()
      if (event.key === 'Escape') {
        resetView()
        return
      }
      const id = ATTACHMENT_IDS[Number(event.key) - 1]
      if (id && layout?.parts[id]) select(id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
