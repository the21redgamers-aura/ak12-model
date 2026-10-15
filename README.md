# AK-12 Armory

Interactive 3D breakdown of the AK-12 as it plays in Rainbow Six Siege. Orbit the rifle, click an attachment (on the mesh or its marker), and the camera flies in while a HUD panel shows that slot's in-game effects and tactical use.

**Stack:** Vite · React 19 · TypeScript · Tailwind v4 · React Three Fiber · drei · maath · Zustand · Framer Motion

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run verify       # lint (0 warnings) → unit tests → typecheck + production build
```

Requires Node 22.18+ (the model inspector imports the TypeScript config directly).

## Adding the model

1. Put `ak12.glb` in the repository root. Vite copies it to `public/models/` on every dev/build start (that copy is git-ignored).
2. Run `npm run inspect:model`. It prints every node **as three.js will name it** and checks the attachment mapping.
3. Fill in `GLB_NODE_MAP` in `src/config/modelConfig.ts` with the node names for each attachment. Several names per attachment are allowed.
4. If the muzzle doesn't point along +X, adjust `MODEL_ROTATION` in the same file.

The mapping is intentionally empty until real names are known. Any attachment that doesn't resolve is listed in an on-screen warning (with every node in the file) and by `npm run inspect:model -- --strict` (exits 1). Nothing gets guessed. Until the GLB exists, a labelled placeholder rifle runs through the same pipeline so the app stays fully usable and deployable.

## Structure

```
src/
  three/          3D only: canvas, lighting, weapon rig, hotspots, camera
    lib/          pure scene logic (node resolution, raycast → attachment) + tests
  ui/             DOM overlays: header, slot nav, detail panel / bottom sheet
  state/          Zustand store (selection, hover, layout, model status)
  data/           AK-12 + attachment data
  config/         model URL, orientation, node mapping
scripts/          inspect-model.mjs
```

## Performance notes

- `frameloop="demand"`: the GPU idles when nothing moves; the camera tween requests frames only until it settles.
- Resolution drops while orbiting (`regress` + `AdaptiveDpr`) and restores at rest.
- three.js/R3F load in a lazy chunk after first paint; the HDRI is a code-split 212 kB module instead of a third-party CDN request.
- Contact shadows bake a single frame; textures get capped anisotropic filtering.

## Deploy (Vercel)

Import the repo in Vercel; `vercel.json` sets the build. Make sure `ak12.glb` is committed in the root so the build can copy it. Hashed assets are cached immutably.

## Data accuracy

Siege rebalances weapons most seasons. Base stats in `src/data/weapon.ts` are long-standing values, and attachment effects mirror the in-game descriptions. Check them against the current patch before publishing.
