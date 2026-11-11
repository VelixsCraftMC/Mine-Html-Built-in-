import { TextureLoader } from "../../shaders/RenderVulkan/texture-loader.js";
import { Assets } from "../../core/assets.js";

const MAX_SIZE = 4096;
const INSET = 0.02; // setengah-persen piksel: cegah bocor antar tile pada filter NEAREST

const loadImage = url => new Promise(resolve => {
  const img = new Image();
  img.onload = () => { img.onload = img.onerror = null; resolve(img); };
  img.onerror = () => { img.onload = img.onerror = null; console.warn("[Atlas] gagal memuat:", url); resolve(null); };
  img.src = Assets.url(url);
});

// Semua tekstur blok dalam satu atlas (satu bind per frame). Slot 0 = tekstur "hilang" (kotak ungu-hitam).
// Path yang sama hanya mengambil satu slot, jadi tekstur dipakai bersama tidak digandakan.
export class TextureAtlas {
  constructor() {
    this.paths = [null];
    this.slots = new Map();
    this.cols = 1;
    this.rects = null;
    this.texture = null;
  }

  require(path) {
    if (this.rects) { console.warn("[Atlas] sudah dibekukan, tekstur ditolak:", path); return 0; }
    let s = this.slots.get(path);
    if (s === undefined) { s = this.paths.length; this.paths.push(path); this.slots.set(path, s); }
    return s;
  }

  // Kunci susunan: setelah ini rect() tetap. Dipanggil sekali setelah semua blok (dan mod) terdaftar.
  freeze() {
    const n = this.paths.length;
    this.cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / this.cols), e = INSET;
    this.rects = this.paths.map((_, i) => {
      const c = i % this.cols, r = Math.floor(i / this.cols);
      return [(c + e / 16) / this.cols, (r + e / 16) / rows, (c + 1 - e / 16) / this.cols, (r + 1 - e / 16) / rows];
    });
    return this;
  }

  rect(slot) { return this.rects[slot] || this.rects[0]; }

  async build(gl) {
    const imgs = await Promise.all(this.paths.map(p => (p ? loadImage(p) : null)));
    const tile = Math.min(Math.max(16, ...imgs.map(i => (i ? i.width : 0))), Math.floor(MAX_SIZE / this.cols));
    const rows = Math.ceil(this.paths.length / this.cols);
    const cv = document.createElement("canvas");
    cv.width = tile * this.cols;
    cv.height = tile * rows;
    const g = cv.getContext("2d");
    g.imageSmoothingEnabled = false;
    imgs.forEach((img, i) => {
      const x = (i % this.cols) * tile, y = Math.floor(i / this.cols) * tile;
      if (img) { g.drawImage(img, x, y, tile, tile); return; }
      g.fillStyle = "#000"; g.fillRect(x, y, tile, tile);
      g.fillStyle = "#f800f8"; g.fillRect(x, y, tile / 2, tile / 2); g.fillRect(x + tile / 2, y + tile / 2, tile / 2, tile / 2);
    });
    this.texture = TextureLoader.fromCanvas(gl, cv, null, false);
    cv.width = cv.height = 0; // lepas memori kanvas; data sudah di GPU
    return this.texture;
  }

  dispose(gl) {
    TextureLoader.dispose(gl, this.texture);
    this.texture = null;
  }
}
