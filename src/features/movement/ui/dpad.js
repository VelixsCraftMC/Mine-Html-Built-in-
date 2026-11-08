import { Icon } from "./icon.js";

// D-pad 3x3: satu area sentuh untuk seluruh grid, jadi jari boleh digeser antar arah
// dan sudut grid = diagonal. Sel tengah dipakai tombol jongkok (di luar kelas ini).
export class DPad {
  constructor(parent, input) {
    this.input = input;
    this.touchId = null;
    this.left = 0; this.top = 0; this.cell = 1;
    this.arrows = { up: new Icon(parent, "up"), down: new Icon(parent, "down"),
      left: new Icon(parent, "left"), right: new Icon(parent, "right") };

    this.zone = document.createElement("div");
    this.zone.style.cssText = "position:fixed;z-index:9998;touch-action:none;";
    parent.appendChild(this.zone);

    this.handleStart = (e) => {
      e.preventDefault();
      if (this.touchId !== null) return;
      const t = e.changedTouches[0];
      this.touchId = t.identifier;
      this.apply(t.clientX, t.clientY);
    };
    this.handleMove = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.touchId) this.apply(t.clientX, t.clientY);
      }
    };
    this.handleEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) { this.touchId = null; this.release(); }
      }
    };
    const z = this.zone;
    z.addEventListener("touchstart", this.handleStart, { passive: false });
    z.addEventListener("touchmove", this.handleMove, { passive: false });
    z.addEventListener("touchend", this.handleEnd, { passive: true });
    z.addEventListener("touchcancel", this.handleEnd, { passive: true });
  }

  // x, y = pojok kiri-atas grid, cell = ukuran satu tombol
  layout(x, y, cell) {
    this.left = x; this.top = y; this.cell = cell;
    const s = this.zone.style;
    s.left = x + "px"; s.top = y + "px"; s.width = s.height = cell * 3 + "px";
    const a = this.arrows;
    a.up.place(x + cell, y, cell);
    a.left.place(x, y + cell, cell);
    a.right.place(x + cell * 2, y + cell, cell);
    a.down.place(x + cell, y + cell * 2, cell);
  }

  apply(px, py) {
    const col = Math.min(2, Math.max(0, Math.floor((px - this.left) / this.cell)));
    const row = Math.min(2, Math.max(0, Math.floor((py - this.top) / this.cell)));
    this.set(row === 0, row === 2, col === 0, col === 2);
  }

  release() {
    this.set(false, false, false, false);
  }

  set(f, b, l, r) {
    this.input.setDirs(f, b, l, r);
    const a = this.arrows;
    a.up.setPressed(f); a.down.setPressed(b); a.left.setPressed(l); a.right.setPressed(r);
  }

  dispose() {
    const z = this.zone;
    z.removeEventListener("touchstart", this.handleStart);
    z.removeEventListener("touchmove", this.handleMove);
    z.removeEventListener("touchend", this.handleEnd);
    z.removeEventListener("touchcancel", this.handleEnd);
    if (z.parentNode) z.parentNode.removeChild(z);
    Object.values(this.arrows).forEach(a => a.dispose());
    this.arrows = null;
    this.input = null;
    this.zone = null;
  }
}
