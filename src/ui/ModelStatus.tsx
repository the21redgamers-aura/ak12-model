import { useState } from 'react'
import { ATTACHMENTS } from '../data/weapon'
import { useArmoryStore } from '../state/useArmoryStore'

/**
 * Tells the user plainly when the scene is not showing what they expect:
 * the placeholder is in use, the GLB failed to load, or attachment nodes
 * are missing from the GLB. Never silent, never guessed.
 */
export function ModelStatus() {
  const source = useArmoryStore((s) => s.modelSource)
  const report = useArmoryStore((s) => s.nodeReport)
  const loadError = useArmoryStore((s) => s.loadError)
  const [expanded, setExpanded] = useState(false)

  const missing = source === 'glb' ? (report?.missing ?? []) : []
  if (source === 'glb' && missing.length === 0) return null

  const title =
    source === 'placeholder'
      ? loadError
        ? 'ak12.glb failed to load. Showing placeholder geometry.'
        : 'ak12.glb not found. Showing placeholder geometry.'
      : `Missing attachment nodes in ak12.glb: ${missing.map((id) => ATTACHMENTS[id].slot).join(', ')}`

  return (
    <div role="status" className="hud-panel pointer-events-auto max-w-md border-warn/40 px-3 py-2 font-mono text-[11px]">
      <div className="flex items-start gap-2">
        <span className="text-warn" aria-hidden>
          ▲
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-warn">{title}</p>
          {source === 'placeholder' && (
            <p className="mt-1 text-muted">
              {loadError ?? 'Add ak12.glb to the repository root and restart the dev server.'}
            </p>
          )}
          {source === 'glb' && report && (
            <>
              <p className="mt-1 text-muted">
                Map node names in <code className="text-ink">src/config/modelConfig.ts</code>, or run{' '}
                <code className="text-ink">npm run inspect:model</code>.
              </p>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 text-accent underline-offset-2 hover:underline"
                aria-expanded={expanded}
              >
                {expanded ? 'Hide' : 'Show'} {report.availableNodes.length} nodes in file
              </button>
              {expanded && (
                <ul className="mt-1 max-h-40 overflow-y-auto text-ink/80">
                  {report.availableNodes.map((name, i) => (
                    <li key={`${name}-${i}`}>{name}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
