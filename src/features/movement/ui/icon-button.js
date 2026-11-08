import { Icon } from "./icon.js";

// Ikon yang bisa disentuh (multi-touch aman: tiap tombol melacak jarinya sendiri).
// onDown saat jari menyentuh, onUp saat jari diangkat/dibatalkan.
export class IconButton extends Icon {
  constructor(parent, name, onDown, onUp) {
    super(parent, name);
    this.touchId = null;
    this.onDown = onDown;
    this.onUp = onUp;
    this.el.style.pointerEvents = "auto";
    this.el.style.touchAction = "none";

    this.handleStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.touchId !== null) return;
      this.touchId = e.changedTouches[0].identifier;
      if (this.onDown) this.onDown();
    };
    this.handleEnd = (e) => {
      if (this.touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.touchId = null;
          if (this.onUp) this.onUp();
          return;
        }
      }
    };
    this.el.addEventListener("touchstart", this.handleStart, { passive: false });
    this.el.addEventListener("touchend", this.handleEnd, { passive: true });
    this.el.addEventListener("touchcancel", this.handleEnd, { passive: true });
  }

  dispose() {
    if (this.el) {
      this.el.removeEventListener("touchstart", this.handleStart);
      this.el.removeEventListener("touchend", this.handleEnd);
      this.el.removeEventListener("touchcancel", this.handleEnd);
    }
    this.onDown = null;
    this.onUp = null;
    super.dispose();
  }
}
