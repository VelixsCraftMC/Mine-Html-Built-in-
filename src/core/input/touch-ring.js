const SIZE = 72;        // diameter cincin (px)
const THICK = 6;        // tebal cincin
const STEPS = 48;       // kuantisasi progres: DOM hanya disentuh saat langkah berubah

// Cincin sentuh ala Minecraft Bedrock: muncul di titik jari saat ditahan, terisi searah jarum jam
// sampai penuh (= mulai menghancurkan). Murni visual; progres < 0 menyembunyikannya.
export class TouchRing {
  constructor() {
    const el = document.createElement("div");
    const mask = `radial-gradient(circle farthest-side, transparent ${SIZE / 2 - THICK - 1}px, #000 ${SIZE / 2 - THICK}px)`;
    el.style.cssText = `position:fixed;left:0;top:0;width:${SIZE}px;height:${SIZE}px;border-radius:50%;
      pointer-events:none;display:none;z-index:9000;will-change:transform;
      -webkit-mask:${mask};mask:${mask};`;
    document.body.appendChild(el);
    this.el = el;
    this.visible = false;
    this.step = -1;
    this.x = NaN;
    this.y = NaN;
  }

  update(progress, x, y) {
    if (!this.el) return;
    if (progress < 0) {
      if (this.visible) { this.el.style.display = "none"; this.visible = false; this.step = -1; }
      return;
    }
    if (!this.visible) { this.el.style.display = "block"; this.visible = true; }
    if (x !== this.x || y !== this.y) {
      this.x = x; this.y = y;
      this.el.style.transform = `translate(${x - SIZE / 2}px,${y - SIZE / 2}px)`;
    }
    const step = Math.min(STEPS, Math.round(progress * STEPS));
    if (step !== this.step) {
      this.step = step;
      const deg = (step / STEPS) * 360;
      this.el.style.background = step >= STEPS
        ? "rgba(255,255,255,0.95)"
        : `conic-gradient(rgba(255,255,255,0.95) ${deg}deg, rgba(255,255,255,0.28) 0)`;
    }
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}
