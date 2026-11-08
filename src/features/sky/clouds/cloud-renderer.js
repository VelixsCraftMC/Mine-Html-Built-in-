import { ShaderProgram } from "../../../shaders/RenderVulkan/shader-program.js";
import { TextureLoader } from "../../../shaders/RenderVulkan/texture-loader.js";
import { FullscreenQuad } from "../../../shaders/RenderVulkan/fullscreen-quad.js";
import { ShaderPack } from "../../../shaders/shader-pack.js";

const TEXTURE = "assets/sky/clouds.png"; // 256x256, 1 piksel = 1 sel awan 12x12 blok
const CLOUD_Y = 128;                       // tinggi bidang awan (blok)
const PERIOD = 12 * 256;                   // satu putaran tekstur (blok)
const WIND = 0.6;                          // blok/detik (0,03 blok/tick ala Minecraft Java)

// Awan "fast" (datar): satu pass layar penuh tanpa geometri, murah untuk GPU Android.
export class CloudRenderer {
  constructor(glContext) {
    const gl = this.gl = glContext.getGL();
    this.program = ShaderPack.create(gl, "clouds");
    const loc = n => gl.getUniformLocation(this.program, n);
    this.u = { inv: loc("u_invViewProj"), tex: loc("u_texture"), cam: loc("u_camPos"), cloud: loc("u_cloud") };
    this.quad = FullscreenQuad.create(gl);
    this.texture = TextureLoader.load(gl, TEXTURE, null, [0, 0, 0, 0]); // placeholder transparan = tanpa awan
    this.t0 = performance.now();
  }

  render(camera) {
    const gl = this.gl, cam = camera.position;
    const height = CLOUD_Y - cam[1];
    if (!gl || !this.program || height <= 0) return; // kamera di atas awan: tidak digambar
    const wind = ((performance.now() - this.t0) * 0.001 * WIND) % PERIOD; // tetap kecil agar presisi terjaga

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.u.tex, 0);
    gl.uniformMatrix4fv(this.u.inv, false, camera.getInvViewProj());
    gl.uniform3f(this.u.cam, cam[0], cam[1], cam[2]);
    gl.uniform2f(this.u.cloud, height, wind);
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
