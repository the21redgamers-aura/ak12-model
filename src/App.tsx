import { lazy, Suspense } from 'react'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { AttachmentNav } from './ui/AttachmentNav'
import { DetailPanel } from './ui/DetailPanel'
import { Header } from './ui/Header'
import { LoadingOverlay } from './ui/LoadingOverlay'
import { ModelStatus } from './ui/ModelStatus'

// three.js + R3F are ~80% of the bundle; load them after first paint.
const ArmoryCanvas = lazy(() => import('./three/ArmoryCanvas'))

export default function App() {
  useKeyboardShortcuts()

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <ArmoryCanvas />
        </Suspense>
      </div>

      {/* Overlays never block the canvas except where they draw something. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] md:p-6">
        <div className="flex flex-col gap-3">
          <Header />
          <ModelStatus />
        </div>
        <div className="md:absolute md:top-1/2 md:left-6 md:-translate-y-1/2">
          <AttachmentNav />
        </div>
        <p className="hud-label hidden text-center md:block">
          Drag to orbit · Scroll to zoom · Click a marker to inspect · 1–4 jump to slot
        </p>
      </div>

      <DetailPanel />
      <LoadingOverlay />
    </main>
  )
}
