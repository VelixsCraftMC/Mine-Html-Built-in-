import { SwingAnim } from "./swing-anim.js";

const TICK_MS = 50;

// Status animasi pemain. Sumber aksi (sentuh sekarang, entity/blok nanti)
// cukup mengimplementasikan consumeAttack() dan isMining().
export class PlayerAnimator {
  constructor() {
    this.swing = new SwingAnim();
    this.ageMs = 0;
  }

  update(dtMs, actions) {
    this.ageMs += dtMs;
    if (actions) {
      if (actions.consumeAttack()) this.swing.swing();
      if (actions.isMining()) this.swing.swing();
    }
    this.swing.update(dtMs);
  }

  // ageInTicks Minecraft (dipakai napas idle)
  get age() {
    return this.ageMs / TICK_MS;
  }

  get swingProgress() {
    return this.swing.progress;
  }
}
