import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { Mesh, MeshStandardMaterial, type Texture } from 'three'
import { MODEL_URL } from '../config/modelConfig'

const TEXTURE_SLOTS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const

export function GlbRifle() {
  // Draco and Meshopt decoders are enabled by drei and only fetched if the
  // file actually uses those compressions.
  const { scene } = useGLTF(MODEL_URL)
  const gl = useThree((s) => s.gl)

  useLayoutEffect(() => {
    // Anisotropic filtering keeps camo detail sharp at the grazing angles a
    // long rifle is mostly viewed from; capped at 8 for mobile GPUs.
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    const touched = new Set<Texture>()
    scene.traverse((child) => {
      if (!(child instanceof Mesh) || !(child.material instanceof MeshStandardMaterial)) return
      for (const slot of TEXTURE_SLOTS) {
        const texture = child.material[slot]
        if (texture && !touched.has(texture)) {
          texture.anisotropy = anisotropy
          texture.needsUpdate = true
          touched.add(texture)
        }
      }
    })
  }, [scene, gl])

  return <primitive object={scene} />
}

if (__AK12_MODEL_AVAILABLE__) useGLTF.preload(MODEL_URL)
