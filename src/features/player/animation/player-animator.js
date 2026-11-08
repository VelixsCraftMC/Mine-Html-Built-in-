import { SwingAnim } from "./swing-anim.js";
import { LimbSwing } from "./limb-swing.js";

const TICK_MS = 50;

// Status animasi pemain. Sumber aksi (sentuh sekarang, entity/blok nanti)
// cukup mengimplementasikan consumeAttack() dan isMining().
export class PlayerAnimator {
  constructor() {
    this.swing = new SwingAnim();
    this.limb = new LimbSwing();
    this.ageMs = 0;
  }

  // moveDist: jarak horizontal yang ditempuh pemain selama dtMs (untuk ayunan jalan)
  update(dtMs, actions, moveDist = 0) {
    this.ageMs += dtMs;
    this.limb.update(moveDist, dtMs);
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

  get limbPos() {
    return this.limb.pos;
  }

  get limbSpeed() {
    return this.limb.speed;
  }

  get swinging() {
    return this.swing.active;
  }

  get swingProgress() {
    return this.swing.progress;
  }
}
