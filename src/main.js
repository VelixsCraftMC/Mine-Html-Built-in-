import { DeviceGuard } from "./core/platform/device-guard.js";
import { OrientationLock } from "./core/platform/orientation-lock.js";
import { WebGLContext } from "./core/render/webgl-context.js";
import { TouchLook } from "./core/input/touch-look.js";
import { TouchAction } from "./core/input/touch-action.js";
import { TouchRing } from "./core/input/touch-ring.js";
import { Camera } from "./features/camera/camera.js";
import { PerspectiveButton } from "./features/camera/ui/perspective-btn.js";
import { SkyRenderer } from "./features/sky/sky-renderer.js";
import { PlayerRenderer } from "./features/player/player-renderer.js";
import { MoveInput } from "./features/movement/move-input.js";
import { PlayerState } from "./features/movement/player-state.js";
import { PlayerPhysics } from "./features/movement/physics.js";
import { ViewBob } from "./features/movement/view-bob.js";
import { AirborneGate } from "./features/movement/air-gate.js";
import { MoveControls } from "./features/movement/ui/move-controls.js";

const MAX_DT_MS = 100; // batasi lonjakan waktu (tab di-background, lag)

class MineHTMLApp {
  constructor() {
    this.glContext = null;
    this.touchLook = null;
    this.touchAction = null;
    this.camera = null;
    this.perspectiveBtn = null;
    this.skyRenderer = null;
    this.playerRenderer = null;
    this.moveInput = null;
    this.playerState = null;
    this.physics = null;
    this.moveControls = null;
    this.actions = null;
    this.touchRing = null;
    this.lastTime = 0;
    this.frameId = null;
    this.boundLoop = this.loop.bind(this);
  }

  init() {
    if (!DeviceGuard.validate()) return;
    OrientationLock.init();

    this.glContext = new WebGLContext();
    this.touchLook = new TouchLook(this.glContext.canvas);
    this.touchAction = new TouchAction(this.glContext.canvas);
    this.camera = new Camera(70);
    this.perspectiveBtn = new PerspectiveButton(this.camera);
    this.skyRenderer = new SkyRenderer(this.glContext);
    this.playerRenderer = new PlayerRenderer(this.glContext);

    this.moveInput = new MoveInput();
    this.playerState = new PlayerState();
    this.physics = new PlayerPhysics(); // world nanti menyuplai getGround
    this.moveControls = new MoveControls(this.moveInput);
    this.actions = new AirborneGate(this.touchAction, this.playerState);
    this.touchRing = new TouchRing();

    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  loop() {
    try {
      const { dx, dy } = this.touchLook.consumeDelta();
      if (dx !== 0 || dy !== 0) this.camera.rotate(dx, dy);

      const now = performance.now();
      const dtMs = Math.min(now - this.lastTime, MAX_DT_MS);
      this.lastTime = now;
      const s = this.playerState;
      this.physics.update(s, this.moveInput, this.camera.yaw, dtMs);
      ViewBob.update(s, dtMs);
      this.moveControls.sync(s);
      this.touchRing.update(this.actions.holdProgress(), this.actions.touchX, this.actions.touchY);

      this.camera.follow(s.pos, s.eye);
      this.camera.update(this.glContext.getAspect(), s.bob);

      const gl = this.glContext.getGL();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 1. Gambar Langit Gradasi
      gl.disable(gl.DEPTH_TEST);
      this.skyRenderer.render(this.camera);

      // 2. Gambar Karakter Pemain (animasi pukul mengikuti input sentuh)
      gl.clear(gl.DEPTH_BUFFER_BIT);
      this.playerRenderer.render(this.camera, this.actions, s);
    } catch (err) {
      console.error("[MineHTML Loop Safe Error]", err);
    }

    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  destroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (this.perspectiveBtn) this.perspectiveBtn.dispose();
    if (this.moveControls) this.moveControls.dispose();
    if (this.touchRing) this.touchRing.dispose();
    if (this.touchLook) this.touchLook.dispose();
    if (this.touchAction) this.touchAction.dispose();
    if (this.skyRenderer) this.skyRenderer.dispose();
    if (this.playerRenderer) this.playerRenderer.dispose();
    if (this.glContext) this.glContext.dispose();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new MineHTMLApp().init();
});
