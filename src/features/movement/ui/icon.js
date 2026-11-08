const DIR = "assets/control/";

// Satu ikon tombol bertekstur pixel-art (normal / _pressed). Hanya visual, tanpa input.
export class Icon {
  constructor(parent, name) {
    this.normal = `url('${DIR}${name}.png')`;
    this.down = `url('${DIR}${name}_pressed.png')`;
    this.pressed = false;
    // Prapemuatan agar tidak berkedip saat pertama ditekan
    this.preload = new Image();
    this.preload.src = `${DIR}${name}_pressed.png`;

    const el = document.createElement("div");
    el.style.cssText = `position:fixed;background-repeat:no-repeat;background-size:100% 100%;
      image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none;
      -webkit-tap-highlight-color:transparent;z-index:9999;background-image:${this.normal};`;
    parent.appendChild(el);
    this.el = el;
  }

  place(x, y, size) {
    const s = this.el.style;
    s.left = x + "px"; s.top = y + "px";
    s.width = size + "px"; s.height = size + "px";
  }

  setPressed(v) {
    if (v === this.pressed || !this.el) return;
    this.pressed = v;
    this.el.style.backgroundImage = v ? this.down : this.normal;
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.preload = null;
    this.el = null;
  }
}
