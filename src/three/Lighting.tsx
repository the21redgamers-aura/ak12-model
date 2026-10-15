import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { use } from 'react'
import { useArmoryStore } from '../state/useArmoryStore'

// CC0 warehouse HDRI bundled as a code-split module: no runtime CDN request,
// and it suspends like any other asset.
const warehouseHdri = import('@pmndrs/assets/hdri/warehouse.exr')

/**
 * Armory look: a dim warehouse HDRI for believable reflections, studio strip
 * lights baked into the same environment map for crisp edge highlights, and
 * a key/rim pair for shape. Contact shadows render a single frame, so they
 * cost nothing after load.
 */
export function Lighting() {
  const hdri = use(warehouseHdri).default
  const groundY = useArmoryStore((s) => s.layout?.groundY ?? -0.6)

  return (
    <>
      <Environment files={hdri} environmentIntensity={0.85} resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 0.6, 1]} />
        <Lightformer form="rect" color="#5ef2e2" intensity={1.4} position={[5, 0.5, -2]} rotation-y={-Math.PI / 2} scale={[6, 0.4, 1]} />
      </Environment>

      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#7fe9df" />
      <ambientLight intensity={0.08} />

      <ContactShadows
        key={groundY}
        position={[0, groundY - 0.02, 0]}
        scale={7}
        far={2.5}
        blur={2.4}
        opacity={0.6}
        resolution={512}
        frames={1}
        color="#000a0c"
      />
    </>
  )
}
