import { ShaderProgram } from "../../../shaders/RenderVulkan/shader-program.js";
import { TextureLoader } from "../../../shaders/RenderVulkan/texture-loader.js";
import { FullscreenQuad } from "../../../shaders/RenderVulkan/fullscreen-quad.js";
import { ShaderPack } from "../../../shaders/shader-pack.js";

const TEXTURE = "assets/sky/clouds.png"; // 256x256, 1 piksel = 1 sel awan

// Semua angka awan di satu tempat. Nilai default = Minecraft Java (Fancy clouds).
// Ubah lewat: new CloudRenderer(glContext, { height: 192 }) atau CloudRenderer.defaults.
export const CloudConfig = {
  height: 128,     // y dasar awan (blok). MC lama 128; MC 1.18+ memakai 192
  thickness: 4,    // tebal awan (blok), sama seperti Minecraft
  cell: 12,        // sisi satu sel awan (blok), sama seperti Minecraft
  wind: 0.6,       // blok/detik (0,03 blok/tick ala Minecraft Java)
  alpha: 0.8,      // keburaman awan Minecraft
  fadeStart: 300,  // jarak mendatar mulai memudar (blok)
  fadeEnd: 650     // jarak mendatar awan hilang total (blok)
};

// Awan 3D tanpa geometri: satu pass layar penuh, ray-march grid di fragment shader.
export class CloudRenderer {
  constructor(glContext, config = {}) {
    const gl = this.gl = glContext.getGL();
    this.cfg = { ...CloudConfig, ...config };
    this.period = this.cfg.cell * 256; // satu putaran tekstur (blok)
    this.program = ShaderPack.create(gl, "clouds");
    const loc = n => gl.getUniformLocation(this.program, n);
    this.u = { inv: loc("u_invViewProj"), tex: loc("u_texture"), cam: loc("u_camPos"), cloud: loc("u_cloud"), fade: loc("u_fade") };
    this.quad = FullscreenQuad.create(gl);
    this.ready = false; // jangan gambar sebelum clouds.png termuat
    this.texture = TextureLoader.load(gl, TEXTURE, null, [0, 0, 0, 0], () => { this.ready = true; });
    this.t0 = performance.now();
  }

  render(camera) {
    const gl = this.gl;
    if (!gl || !this.program || !this.ready) return;
    const c = this.cfg, cam = camera.position;
    const wind = ((performance.now() - this.t0) * 0.001 * c.wind) % this.period; // tetap kecil agar presisi terjaga

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.u.tex, 0);
    gl.uniformMatrix4fv(this.u.inv, false, camera.getInvViewProj());
    gl.uniform3f(this.u.cam, cam[0], cam[1], cam[2]);
    gl.uniform4f(this.u.cloud, c.height, c.height + c.thickness, wind, c.cell);
    gl.uniform3f(this.u.fade, c.fadeStart, c.fadeEnd, c.alpha);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    FullscreenQuad.draw(gl, this.quad);
    gl.disable(gl.BLEND);
  }

  dispose() {
    const gl = this.gl;
    if (gl) {
      FullscreenQuad.dispose(gl, this.quad);
      TextureLoader.dispose(gl, this.texture);
      ShaderProgram.dispose(gl, this.program);
    }
    this.quad = this.texture = this.program = this.gl = null;
  }
}
