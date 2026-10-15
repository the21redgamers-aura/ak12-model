import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useRef, type ComponentRef } from 'react'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { MODEL_TARGET_LENGTH } from '../config/modelConfig'
import { ATTACHMENTS } from '../data/weapon'
import { useArmoryStore } from '../state/useArmoryStore'
import { MOBILE_BREAKPOINT_PX } from '../ui/layout'

const SMOOTH_TIME = 0.4
const OVERVIEW_DIRECTION = new Vector3(-0.35, 0.28, 1).normalize()
const MIN_DISTANCE = 0.9
const MAX_DISTANCE = 10

interface CameraGoal {
  readonly position: Vector3
  readonly target: Vector3
}

/** Distance at which a sphere of `radius` fills the narrower FOV with margin. */
function fitDistance(camera: PerspectiveCamera, aspect: number, radius: number, margin: number) {
  const vFov = MathUtils.degToRad(camera.fov)
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
  return (radius * margin) / Math.sin(Math.min(vFov, hFov) / 2)
}

export function CameraRig() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const goal = useRef<CameraGoal | null>(null)
  const viewOffset = useRef({ x: 0, y: 0 })
  const get = useThree((s) => s.get)
  const invalidate = useThree((s) => s.invalidate)

  const selected = useArmoryStore((s) => s.selected)
  const layout = useArmoryStore((s) => s.layout)
  const overviewRequest = useArmoryStore((s) => s.overviewRequest)

  // Compute a new goal whenever the selection, layout or overview request changes.
  useEffect(() => {
    const { camera, size } = get()
    if (!(camera instanceof PerspectiveCamera)) return
    const aspect = size.width / Math.max(size.height, 1)
    const part = selected ? layout?.parts[selected] : undefined

    if (selected && part) {
      const target = new Vector3(...part.center)
      const direction = new Vector3(...ATTACHMENTS[selected].viewDirection).normalize()
      const distance = MathUtils.clamp(fitDistance(camera, aspect, part.radius, 3.4), 1.5, 4.5)
      goal.current = { target, position: target.clone().addScaledVector(direction, distance) }
    } else {
      // The rifle is long and thin: fit its half-length, not a bounding sphere.
      const distance = fitDistance(camera, aspect, MODEL_TARGET_LENGTH / 2, 1.08)
      goal.current = {
        target: new Vector3(0, 0, 0),
        position: OVERVIEW_DIRECTION.clone().multiplyScalar(MathUtils.clamp(distance, 3, MAX_DISTANCE)),
      }
    }
    invalidate()
  }, [selected, layout, overviewRequest, get, invalidate])

  useFrame((state, delta) => {
    const camera = state.camera
    const orbit = controls.current
    if (!(camera instanceof PerspectiveCamera) || !orbit) return
    let animating = false

    if (goal.current) {
      const movingPos = easing.damp3(camera.position, goal.current.position, SMOOTH_TIME, delta)
      const movingTarget = easing.damp3(orbit.target, goal.current.target, SMOOTH_TIME, delta)
      orbit.update()
      if (movingPos || movingTarget) animating = true
      else goal.current = null
    }

    // Slide the projection so the focused part clears the overlay:
    // left of the side panel on desktop, above the bottom sheet on mobile.
    const { width, height } = state.size
    const mobile = width < MOBILE_BREAKPOINT_PX
    const open = useArmoryStore.getState().selected !== null
    const offset = viewOffset.current
    const movingX = easing.damp(offset, 'x', open && !mobile ? 0.16 : 0, SMOOTH_TIME, delta)
    const movingY = easing.damp(offset, 'y', open && mobile ? 0.2 : 0, SMOOTH_TIME, delta)
    if (Math.abs(offset.x) + Math.abs(offset.y) > 1e-4) {
      camera.setViewOffset(width, height, offset.x * width, offset.y * height, width, height)
    } else if (camera.view?.enabled) {
      camera.clearViewOffset()
    }
    if (movingX || movingY) animating = true

    // frameloop="demand": keep requesting frames only while something moves.
    if (animating) invalidate()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      regress
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      zoomSpeed={0.7}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      minPolarAngle={Math.PI * 0.12}
      maxPolarAngle={Math.PI * 0.62}
      // Any manual input cancels an in-flight tween so the user stays in control.
      onStart={() => {
        goal.current = null
      }}
    />
  )
}
