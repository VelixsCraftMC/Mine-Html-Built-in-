import { Assets } from "../../../core/assets.js";
export class PerspectiveButton {
  constructor(camera) {
    this.camera = camera;
    this.button = null;
    this.onTouchStart = this.handleTouchStart.bind(this);
    this.onTouchEnd = this.handleTouchEnd.bind(this);
    this.init();
  }

  init() {
    const btn = document.createElement("button");
    btn.id = "btn-perspective";
    btn.style.cssText = `
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%) scale(1.0);
      width: 36px;
      height: 36px;
      padding: 0;
      margin: 0;
      background-color: transparent;
      background-image: url('${Assets.url("assets/control/perspective.png")}');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 32px 32px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      border: none;
      outline: none;
      box-shadow: none;
      touch-action: none;
      z-index: 10000;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.08s ease;
    `;

    btn.addEventListener("touchstart", this.onTouchStart, { passive: false });
    btn.addEventListener("touchend", this.onTouchEnd, { passive: true });
    btn.addEventListener("touchcancel", this.onTouchEnd, { passive: true });

    document.body.appendChild(btn);
    this.button = btn;
  }

  handleTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();

    // Efek tekan tombol halus tanpa kotak background
    this.button.style.transform = "translateX(-50%) scale(0.86)";
    this.camera.cyclePerspective();
  }

  handleTouchEnd() {
    if (this.button) {
      this.button.style.transform = "translateX(-50%) scale(1.0)";
    }
  }

  dispose() {
    if (this.button) {
      this.button.removeEventListener("touchstart", this.onTouchStart);
      this.button.removeEventListener("touchend", this.onTouchEnd);
      this.button.removeEventListener("touchcancel", this.onTouchEnd);
      if (this.button.parentNode) this.button.parentNode.removeChild(this.button);
    }
    this.button = null;
    this.camera = null;
  }
}