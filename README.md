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

> **Project scope:** The repository contains player, camera, movement, and rendering features. It does not currently include a voxel world or block-building system.

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

Then open **http://localhost:8000** in a WebGL 2-capable browser. No build step is defined in the repository.

## 🗂️ Project map

```text
assets/                 Textures, player model, and control icons
src/core/               Platform, input, math, and options utilities
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
