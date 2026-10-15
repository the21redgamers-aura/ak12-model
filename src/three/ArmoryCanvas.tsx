import { AdaptiveDpr } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Component, Suspense, type ReactNode } from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { GLB_NODE_MAP, PLACEHOLDER_NODE_MAP } from '../config/modelConfig'
import { useArmoryStore } from '../state/useArmoryStore'
import { CameraRig } from './CameraRig'
import { GlbRifle } from './GlbRifle'
import { Hotspots } from './Hotspots'
import { Lighting } from './Lighting'
import { PlaceholderRifle } from './PlaceholderRifle'
import { WeaponRig } from './WeaponRig'

class ModelErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    useArmoryStore.getState().failModelLoad(message)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Weapon() {
  const source = useArmoryStore((s) => s.modelSource)
  if (source === 'placeholder') {
    return (
      <WeaponRig nodeMap={PLACEHOLDER_NODE_MAP}>
        <PlaceholderRifle />
      </WeaponRig>
    )
  }
  return (
    <ModelErrorBoundary>
      <WeaponRig nodeMap={GLB_NODE_MAP}>
        <GlbRifle />
      </WeaponRig>
    </ModelErrorBoundary>
  )
}

export default function ArmoryCanvas() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      // While the user orbits, OrbitControls (regress) lowers DPR toward
      // `min`; it restores full resolution once input settles.
      performance={{ min: 0.5, debounce: 250 }}
      camera={{ fov: 32, near: 0.05, far: 60, position: [-1.6, 1.4, 6] }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      aria-label="Interactive 3D model of the AK-12"
    >
      <AdaptiveDpr />
      {/* Loading UI lives in the DOM (ui/LoadingOverlay); an in-canvas <Html>
          fallback races React when Suspense resolves. */}
      <Suspense fallback={null}>
        <Lighting />
        <Weapon />
        <Hotspots />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
