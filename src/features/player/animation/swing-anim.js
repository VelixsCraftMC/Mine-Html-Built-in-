const SWING_MS = 300;        // 6 tick Minecraft
const RESTART_AT = 0.5;      // saat menghancurkan, ayunan baru dimulai setelah separuh jalan
const RESTART_OFFSET = -1 / 6;

// Progress ayunan 0..1 seperti attackAnim Minecraft
export class SwingAnim {
  constructor() {
    this.t = 0;
    this.active = false;
  }

  // Aman dipanggil tiap frame (mis. saat menghancurkan)
  swing() {
    if (!this.active) {
      this.t = 0;
      this.active = true;
    } else if (this.t >= RESTART_AT) {
      this.t = RESTART_OFFSET;
    }
  }

  update(dtMs) {
    if (!this.active) return;
    this.t += dtMs / SWING_MS;
    if (this.t >= 1) {
      this.t = 0;
      this.active = false;
    }
  }

  get progress() {
    return this.active && this.t > 0 ? this.t : 0;
  }
}
