export class TouchLook {
  constructor(canvas) {
    this.canvas = canvas;
    this.activeTouchId = null;
    this.prevX = 0;
    this.prevY = 0;
    this.deltaX = 0;
    this.deltaY = 0;

    this.onTouchStart = this.handleStart.bind(this);
    this.onTouchMove = this.handleMove.bind(this);
    this.onTouchEnd = this.handleEnd.bind(this);

    this.bindEvents();
  }

  bindEvents() {
    this.canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
    this.canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
    this.canvas.addEventListener("touchend", this.onTouchEnd, { passive: false });
    this.canvas.addEventListener("touchcancel", this.onTouchEnd, { passive: false });
  }

  handleStart(e) {
    e.preventDefault();
    if (this.activeTouchId !== null) return;
    const t = e.changedTouches[0];
    this.activeTouchId = t.identifier;
    this.prevX = t.clientX;
    this.prevY = t.clientY;
  }

  handleMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.activeTouchId) {
        this.deltaX += t.clientX - this.prevX;
        this.deltaY += t.clientY - this.prevY;
        this.prevX = t.clientX;
        this.prevY = t.clientY;
        break;
      }
    }
  }

  handleEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.activeTouchId) {
        this.activeTouchId = null;
        break;
      }
    }
  }

  consumeDelta() {
    const dx = this.deltaX;
    const dy = this.deltaY;
    this.deltaX = 0;
    this.deltaY = 0;
    return { dx, dy };
  }

  dispose() {
    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    this.canvas.removeEventListener("touchmove", this.onTouchMove);
    this.canvas.removeEventListener("touchend", this.onTouchEnd);
    this.canvas.removeEventListener("touchcancel", this.onTouchEnd);
    this.canvas = null;
  }
}