import { TextureLoader } from "../../../core/render/texture-loader.js";

const FONT = "bold 28px monospace";
const HEIGHT_PX = 36;
const PAD_PX = 12;

// Satu canvas + satu tekstur GPU dipakai ulang untuk setiap pergantian nama (tanpa leak)
export class NametagTexture {
  constructor(gl) {
    this.gl = gl;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.texture = null;
    this.aspect = 1; // lebar / tinggi
    this.text = null;
  }

  setText(text) {
    if (!this.gl || text === this.text) return;
    this.text = text;
    const c = this.canvas, ctx = this.ctx;
    ctx.font = FONT;
    c.width = Math.ceil(ctx.measureText(text).width) + PAD_PX * 2; // ukuran berubah = state canvas reset
    c.height = HEIGHT_PX;
    ctx.font = FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, c.width / 2, c.height / 2 + 1);
    this.aspect = c.width / c.height;
    this.texture = TextureLoader.fromCanvas(this.gl, c, this.texture);
  }

  dispose() {
    TextureLoader.dispose(this.gl, this.texture);
    this.texture = null;
    this.canvas.width = this.canvas.height = 0; // lepas memori bitmap
    this.canvas = this.ctx = this.gl = null;
  }
}
