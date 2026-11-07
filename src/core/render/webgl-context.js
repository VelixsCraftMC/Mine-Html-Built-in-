export class WebGLContext {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
    document.body.appendChild(this.canvas);

    const opts = {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false
    };

    this.gl = this.canvas.getContext("webgl2", opts);
    if (!this.gl) {
      throw new Error("WebGL2 tidak didukung pada perangkat ini.");
    }

    this.boundResize = this.resize.bind(this);
    window.addEventListener("resize", this.boundResize, { passive: true });
    window.addEventListener("orientationchange", this.boundResize, { passive: true });
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 untuk efisiensi GPU Android
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  getGL() {
    return this.gl;
  }

  getAspect() {
    return this.canvas.width / (this.canvas.height || 1);
  }

  dispose() {
    window.removeEventListener("resize", this.boundResize);
    window.removeEventListener("orientationchange", this.boundResize);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.gl = null;
    this.canvas = null;
  }
}