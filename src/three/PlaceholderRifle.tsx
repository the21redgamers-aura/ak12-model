import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

/**
 * Low-poly stand-in used when `ak12.glb` is absent, so the full interaction
 * pipeline (raycasting, hotspots, camera) can be exercised and deployed.
 * Muzzle points along +X. Attachment groups use PLACEHOLDER_NODE_MAP names.
 */
export function PlaceholderRifle() {
  const m = useMemo(
    () => ({
      teal: new MeshStandardMaterial({ color: '#2d6b70', metalness: 0.55, roughness: 0.42 }),
      frost: new MeshStandardMaterial({ color: '#c3cfd1', metalness: 0.35, roughness: 0.5 }),
      steel: new MeshStandardMaterial({ color: '#1b1e21', metalness: 0.85, roughness: 0.32 }),
      polymer: new MeshStandardMaterial({ color: '#5b4b40', metalness: 0.05, roughness: 0.7 }),
      glass: new MeshStandardMaterial({ color: '#0d3b45', metalness: 0.9, roughness: 0.05 }),
    }),
    [],
  )

  return (
    <group name="placeholder_ak12">
      {/* Receiver + top cover */}
      <mesh material={m.teal} position={[0, 0, 0]}>
        <boxGeometry args={[1.3, 0.3, 0.2]} />
      </mesh>
      <mesh material={m.teal} position={[0.05, 0.18, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.16]} />
      </mesh>

      {/* Handguard, barrel, gas tube */}
      <mesh material={m.frost} position={[1.1, 0.02, 0]}>
        <boxGeometry args={[0.9, 0.24, 0.19]} />
      </mesh>
      <mesh material={m.frost} position={[1.98, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.95, 16]} />
      </mesh>
      <mesh material={m.frost} position={[1.75, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 12]} />
      </mesh>
      <mesh material={m.frost} position={[2.2, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.22, 0.05]} />
      </mesh>

      <group name="placeholder_barrel" position={[2.56, -0.02, 0]}>
        <mesh material={m.steel} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.062, 0.062, 0.24, 20]} />
        </mesh>
        <mesh material={m.steel} position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 20]} />
        </mesh>
      </group>

      <group name="placeholder_optic" position={[0.15, 0.36, 0]}>
        <mesh material={m.steel} position={[0, -0.09, 0]}>
          <boxGeometry args={[0.3, 0.07, 0.1]} />
        </mesh>
        <mesh material={m.steel} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.46, 24]} />
        </mesh>
        <mesh material={m.glass} position={[0.235, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.012, 24]} />
        </mesh>
      </group>

      <group name="placeholder_grip" position={[1.05, -0.28, 0]}>
        <mesh material={m.steel}>
          <cylinderGeometry args={[0.048, 0.042, 0.32, 16]} />
        </mesh>
      </group>

      <group name="placeholder_magazine" position={[0.4, -0.16, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            material={m.polymer}
            position={[-0.02 + i * 0.07, -0.13 - i * 0.2, 0]}
            rotation={[0, 0, 0.12 + i * 0.12]}
          >
            <boxGeometry args={[0.26, 0.24, 0.13]} />
          </mesh>
        ))}
      </group>

      {/* Pistol grip + stock */}
      <mesh material={m.steel} position={[-0.4, -0.3, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.16, 0.42, 0.14]} />
      </mesh>
      <mesh material={m.teal} position={[-1.15, -0.02, 0]}>
        <boxGeometry args={[0.9, 0.22, 0.12]} />
      </mesh>
      <mesh material={m.teal} position={[-1.55, -0.16, 0]}>
        <boxGeometry args={[0.14, 0.5, 0.14]} />
      </mesh>
    </group>
  )
}
