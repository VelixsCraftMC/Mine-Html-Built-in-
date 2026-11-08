import { MoveConfig } from "./config.js";

// Pembungkus sumber aksi (TouchAction): tahan memukul dimatikan saat di udara,
// tap menyerang tetap berfungsi. Sumber asli tidak perlu tahu soal fisika.
export class AirborneGate {
  constructor(source, state, allowAir = MoveConfig.mineInAir) {
    this.source = source;
    this.state = state;
    this.allowAir = allowAir;
  }

  consumeAttack() {
    return this.source.consumeAttack();
  }

  // Cincin sentuh disembunyikan saat tahan memukul sedang dimatikan (di udara)
  holdProgress() {
    const p = this.source.holdProgress();
    return (this.allowAir || this.state.onGround) ? p : -1;
  }

  get touchX() { return this.source.startX; }
  get touchY() { return this.source.startY; }

  isMining() {
    const holding = this.source.isMining(); // selalu dipanggil agar status tahan tetap akurat
    return holding && (this.allowAir || this.state.onGround);
  }
}
