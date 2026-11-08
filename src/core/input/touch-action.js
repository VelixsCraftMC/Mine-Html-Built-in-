const HOLD_MS = 350; // tahan >= ini = menghancurkan (Minecraft PE)
const RING_DELAY_MS = 90; // cincin baru muncul setelah ditahan sebentar (tap cepat tidak berkedip)
const SLOP_PX = 12;  // geser lebih dari ini = mengarahkan kamera, bukan tap/tahan

// Membedakan tap (serang) dan tahan (hancurkan) dari sentuhan pertama.
// Tanpa timer: status dihitung saat dipolling, jadi tidak ada callback yang bocor.
export class TouchAction {
  constructor(canvas, now = () => performance.now()) {
    this.canvas = canvas;
    this.now = now;
    this.touchId = null;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.moved = false;
    this.holding = false;
    this.attackQueued = false;

    this.onStart = this.handleStart.bind(this);
    this.onMove = this.handleMove.bind(this);
    this.onEnd = this.handleEnd.bind(this);
    const opt = { passive: true };
    canvas.addEventListener("touchstart", this.onStart, opt);
    canvas.addEventListener("touchmove", this.onMove, opt);
    canvas.addEventListener("touchend", this.onEnd, opt);
    canvas.addEventListener("touchcancel", this.onEnd, opt);
  }

  findTouch(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) return e.changedTouches[i];
    }
    return null;
  }

  handleStart(e) {
    if (this.touchId !== null) return;
    const t = e.changedTouches[0];
    this.touchId = t.identifier;
    this.startX = t.clientX;
    this.startY = t.clientY;
    this.startTime = this.now();
    this.moved = false;
    this.holding = false;
  }

  handleMove(e) {
    if (this.touchId === null || this.moved || this.holding) return;
    const t = this.findTouch(e);
    if (!t) return;
    const dx = t.clientX - this.startX;
    const dy = t.clientY - this.startY;
    if (dx * dx + dy * dy > SLOP_PX * SLOP_PX) this.moved = true;
  }

  handleEnd(e) {
    if (!this.findTouch(e)) return;
    const quick = this.now() - this.startTime < HOLD_MS;
    if (e.type === "touchend" && quick && !this.holding && !this.moved) {
      this.attackQueued = true;
    }
    this.touchId = null;
    this.moved = false;
    this.holding = false;
  }

  // True selama jari ditahan diam >= HOLD_MS (dan tetap true sampai jari diangkat)
  isMining() {
    if (!this.holding && this.touchId !== null && !this.moved &&
        this.now() - this.startTime >= HOLD_MS) {
      this.holding = true;
    }
    return this.holding;
  }

  // Progres cincin tahan 0..1, atau -1 bila tidak ada tahan diam yang sedang berlangsung
  holdProgress() {
    if (this.touchId === null || this.moved) return -1;
    const el = this.now() - this.startTime;
    if (el < RING_DELAY_MS) return -1;
    return Math.min(1, (el - RING_DELAY_MS) / (HOLD_MS - RING_DELAY_MS));
  }

  // True satu kali untuk setiap tap
  consumeAttack() {
    const a = this.attackQueued;
    this.attackQueued = false;
    return a;
  }

  dispose() {
    if (!this.canvas) return;
    this.canvas.removeEventListener("touchstart", this.onStart);
    this.canvas.removeEventListener("touchmove", this.onMove);
    this.canvas.removeEventListener("touchend", this.onEnd);
    this.canvas.removeEventListener("touchcancel", this.onEnd);
    this.canvas = null;
  }
}
