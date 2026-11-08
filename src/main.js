import { DeviceGuard } from "./core/platform/device-guard.js";
import { OrientationLock } from "./core/platform/orientation-lock.js";
import { WebGLContext } from "./core/render/webgl-context.js";
import { TouchLook } from "./core/input/touch-look.js";
import { TouchAction } from "./core/input/touch-action.js";
import { Camera } from "./features/camera/camera.js";
import { PerspectiveButton } from "./features/camera/ui/perspective-btn.js";
import { SkyRenderer } from "./features/sky/sky-renderer.js";
import { PlayerRenderer } from "./features/player/player-renderer.js";

class MineHTMLApp {
  constructor() {
    this.glContext = null;
    this.touchLook = null;
    this.touchAction = null;
    this.camera = null;
    this.perspectiveBtn = null;
    this.skyRenderer = null;
    this.playerRenderer = null;
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

    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  loop() {
    try {
      const { dx, dy } = this.touchLook.consumeDelta();
      if (dx !== 0 || dy !== 0) this.camera.rotate(dx, dy);

      this.camera.update(this.glContext.getAspect());

      const gl = this.glContext.getGL();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 1. Gambar Langit Gradasi
      gl.disable(gl.DEPTH_TEST);
      this.skyRenderer.render(this.camera);

      // 2. Gambar Karakter Pemain (animasi pukul mengikuti input sentuh)
      gl.clear(gl.DEPTH_BUFFER_BIT);
      this.playerRenderer.render(this.camera, this.touchAction);
    } catch (err) {
      console.error("[MineHTML Loop Safe Error]", err);
    }

    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  destroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (this.perspectiveBtn) this.perspectiveBtn.dispose();
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
