const TICK_MS = 50;

// Ayunan anggota badan saat berjalan (LivingEntity.calculateEntityAnimation + WalkAnimationState).
// speed = amplitudo 0..1 (halus), pos = fase gelombang. Berbasis waktu, tidak tergantung FPS.
export class LimbSwing {
  constructor() {
    this.pos = 0;
    this.speed = 0;
  }

  // distBlocks = jarak horizontal yang ditempuh selama dtMs
  update(distBlocks, dtMs) {
    if (dtMs <= 0) return;
    const ticks = dtMs / TICK_MS;
    const target = Math.min((distBlocks / ticks) * 4, 1);
    this.speed += (target - this.speed) * (1 - Math.pow(0.6, ticks));
    this.pos += this.speed * ticks;
  }
}
