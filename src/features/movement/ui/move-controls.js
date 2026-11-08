import { DPad } from "./dpad.js";
import { IconButton } from "./icon-button.js";
import { MoveConfig } from "../config.js";

// Merangkai kontrol sentuh: d-pad + jongkok (kiri bawah), lompat + terbang + lari (kanan bawah).
// sync(state) dipanggil tiap frame agar tampilan tombol selalu sama dengan status pemain.
export class MoveControls {
  constructor(input) {
    this.input = input;
    this.lastJumpTap = -1e9;
    const root = document.body;
    this.dpad = new DPad(root, input);
    this.sneak = new IconButton(root, "sneak", () => { input.sneak = !input.sneak; });
    this.jump = new IconButton(root, "jump", () => this.jumpDown(), () => { input.jump = false; });
    this.fly = new IconButton(root, "fly", () => { input.flyToggle = true; });
    this.sprint = new IconButton(root, "sprint", () => { input.sprint = !input.sprint; });

    this.onResize = () => this.layout();
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("orientationchange", this.onResize, { passive: true });
    this.layout();
  }

  jumpDown() {
    const now = performance.now();
    if (now - this.lastJumpTap < MoveConfig.doubleTapMs) {
      this.input.flyToggle = true; // dua kali tap lompat = terbang
      this.lastJumpTap = -1e9;
    } else {
      this.lastJumpTap = now;
    }
    this.input.jump = true;
  }

  layout() {
    const w = window.innerWidth, h = window.innerHeight;
    const unit = 22 * Math.max(2, Math.floor(Math.min(w, h) / 150)); // kelipatan bulat piksel tekstur
    const m = Math.round(unit * 0.5);
    this.dpad.layout(m, h - m - unit * 3, unit);
    this.sneak.place(m + unit, h - m - unit * 2, unit);
    const big = Math.round(unit * 1.5);
    this.jump.place(w - m - big, h - m - big, big);
    this.sprint.place(w - m - big - unit - Math.round(unit / 4), h - m - unit, unit);
    this.fly.place(w - m - unit - Math.round((big - unit) / 2), h - m - big - unit - Math.round(unit / 4), unit);
  }

  sync(state) {
    this.sneak.setPressed(this.input.sneak);
    this.sprint.setPressed(this.input.sprint);
    this.jump.setPressed(this.input.jump);
    this.fly.setPressed(state.flying);
  }

  dispose() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("orientationchange", this.onResize);
    this.dpad.dispose();
    this.sneak.dispose();
    this.jump.dispose();
    this.fly.dispose();
    this.sprint.dispose();
    this.input = null;
  }
}
