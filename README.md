<div align="center">

# ✦ MineHTML ✦
### A Minecraft-inspired, touch-first 3D experience for the browser

`PIXEL WORLDS • WEBGL2 • BUILT-IN FEATURES`

⟡ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⟡

**A modular JavaScript project featuring a Minecraft-style player, camera, movement controls, sky, and customizable shader packs.**

⟡ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⟡

</div>

## ◈ What is MineHTML?

MineHTML is a browser-based 3D prototype built with JavaScript, HTML, and WebGL 2. Its built-in systems bring together a controllable player, touch-friendly input, multiple camera perspectives, and a layered Minecraft-inspired sky.

> **Project scope:** Player, camera, movement, sky, a JSON-driven block system, and a flat chunked world. Placing/breaking blocks, lighting, and world saving are not implemented yet.

## ✧ Built-in features

### 🧍 Player and character rendering
- Minecraft-style player model assembled from separate body parts.
- First-person hand rendering and third-person player rendering.
- Player skin and cape paths configurable through `option.json`.
- Sneak poses, limb movement, arm poses, and swing animations.
- Cape movement physics and player name labels in third-person views.

### 🎥 Camera and perspective
- First-person, rear third-person, and front-facing third-person perspectives.
- Camera follows the player and supports configurable look sensitivity.
- First-person view bobbing and an on-screen perspective switch button.

### 🕹️ Movement and touch controls
- Touch-based look controls and a virtual directional pad.
- Walking, sprinting, sneaking, jumping, and flying inputs.
- Time-based player movement and physics, with a hook for world-provided ground detection.
- Optional touch indicator ring with configurable size.

### ☀️ Layered Minecraft-inspired sky
- Horizon-to-zenith gradient sky.
- Textured sun billboard with adjustable elevation.
- Textured clouds that drift and fade into the distance.
- Extensible sky layers with a shared render/dispose interface.

### ✦ WebGL rendering and shader packs
- WebGL 2 rendering utilities for shader programs, meshes, textures, and fullscreen quads.
- Built-in **VulkanGL** shader pack for player, sky, sun, clouds, and nametags.
- Shader packs can be registered and switched at runtime; missing shaders fall back to the built-in pack.
- Rendering resources expose cleanup/disposal paths.

### ⚙️ Options and platform support
- `option.json` settings are validated, with defaults used for missing or invalid values.
- Includes player name, camera sensitivity, touch-ring settings, skin path, and cape path.
- Device validation and orientation handling are included in the startup flow.

### 🧱 Blocks, world and mods (JSON-driven)
- Each block is a JSON file in `assets/block/<category>/` made of **components**; each component is one small JS file in `src/features/block/components/`.
- Textures live in `assets/textures/block/<block>/`; the same path used twice shares one atlas slot (identical files are never duplicated).
- The world layout is data: `dimension/overworld.flat.json` (generator, layers, biome, spawn, render distance).
- Biome, fog and grass colormap come from `assets/biome`, `assets/fog`, `assets/textures/colormap`.
- Native mods (temporary): `mods/` — see `mods/README.md`.

#### Add a block
1. Create `assets/block/nature/my_block.json`:
```json
{
  "identifier": "minecraft:my_block",
  "components": {
    "displayname": "My Block",
    "textures": { "*": "block/my_block/all" },
    "loot": ["minecraft:my_block"]
  }
}
```
2. Put the PNG at `assets/textures/block/my_block/all.png`, then run `node tools/index.mjs`.
No other file needs editing. Missing `collision` / `selection` / `geometry` means solid, selectable, full block.

#### Components
`displayname`, `category`, `geometry`, `textures` (`*`, `top`, `bottom`, `side`, `north`…`west`, `render_method`, `carried`), `loot`, `transforplacetop` (`{ "to", "tick" }` seconds), `collision`, `selection`, `lightdampening`.

## ⌘ Configuration

Edit `option.json` to adjust the built-in settings:

```json
{
  "playerName": ">_Console",
  "cameraSensitivity": 1.0,
  "touchCircle": {
    "enabled": true,
    "size": 100
  },
  "skinPath": "assets/skins/steve.png",
  "capePath": "assets/cape/cape.png"
}
```

Use image files at the configured paths for custom skins and capes. If an option is missing or invalid, the options loader supplies a valid default.

## ▶ Run locally

This project uses JavaScript ES modules, so serve the repository through a local web server rather than opening `index.html` directly. For example, with Python installed:

```bash
python -m http.server 8000
```

Then open **http://localhost:8000** in a WebGL 2-capable browser. After adding block files run `node tools/index.mjs`. Checks: `node tools/selftest.mjs` (logic) and `node tools/lint.mjs` (structure). `node tools/build.mjs` writes the single-file `dist/minehtml.js`.

## 🗂️ Project map

```text
assets/block/           Block definitions (JSON) + generated index.json
assets/models/          block/ entity/ item/ geometry
assets/textures/        block/<name>/ and colormap/
assets/particles|biome|fog|minimap|sounds/   Particle, biome, fog data (sounds are .fsb, not played yet)
dimension/              World structure as JSON (overworld.flat.json)
mods/                   Native mods (temporary)
src/core/               Platform, input, math, options, json, color utilities
src/features/block/     Block registry, components/, atlas, geometry
src/features/world/     Chunks, generators, streaming, mesher, renderer
src/features/biome/     Biome, fog, colormap
src/features/mods/      Native mod loader
src/features/camera/    Camera and perspective controls
src/features/movement/  Player movement, state, and touch controls
src/features/player/    Player model, rendering, animation, and nametags
src/features/sky/       Sky gradient, sun, and clouds
src/shaders/            WebGL renderer and shader packs
index.html              Browser entry point
option.json             User-configurable settings
```

## ◇ Technology

- **JavaScript** (ES modules)
- **HTML5**
- **WebGL 2**
- **GLSL ES 3.00 shaders**

<div align="center">

⟡ **Explore • Customize • Build** ⟡  
*Small pixels. Big horizons.*

</div>
