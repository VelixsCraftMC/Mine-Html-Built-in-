import { ShaderProgram } from "../../../core/render/shader-program.js";
import { TextureLoader } from "../../../core/render/texture-loader.js";
import { FullscreenQuad } from "../../../core/render/fullscreen-quad.js";
import { SunShaderSource } from "./shaders/sun-glsl.js";

const TEXTURE = "assets/sky/sun.png";
const DISTANCE = 100;      // jarak billboard dari kamera (blok)
const HALF_SIZE = 30;      // setengah sisi billboard, seperti Minecraft (60 blok lebar)
const DEG = Math.PI / 180;
const HIDE_BELOW = -0.35;  // sin(elevasi) di bawah ini = jauh di bawah cakrawala, tidak digambar

// Matahari Minecraft: bergerak di bidang timur (+X) - barat (-X); elevasi 0 = cakrawala timur,
// 90 = zenith. Siklus siang/malam nanti cukup memanggil setElevation(derajat).
export class SunRenderer {
  constructor(glContext, elevation = 40) {
    const gl = this.gl = glContext.getGL();
    this.program = ShaderProgram.create(gl, SunShaderSource.vertex, SunShaderSource.fragment);
    const loc = n => gl.getUniformLocation(this.program, n);
    this.u = { proj: loc("u_projection"), view: loc("u_view"), center: loc("u_center"),
      right: loc("u_right"), up: loc("u_up"), tex: loc("u_texture") };
    this.quad = FullscreenQuad.create(gl);
    // Placeholder hitam: sebelum/bila gagal dimuat, additive tidak menambah cahaya apa pun
    this.texture = TextureLoader.load(gl, TEXTURE, null, [0, 0, 0, 255]);
    this.sin = 0;
    this.cos = 1;
    this.dirty = true;
    this.setElevation(elevation);
  }

  setElevation(deg) {
    this.sin = Math.sin(deg * DEG);
    this.cos = Math.cos(deg * DEG);
    this.dirty = true;
  }

  render(camera) {
    const gl = this.gl;
    if (!gl || !this.program || this.sin < HIDE_BELOW) return;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.u.tex, 0);
    gl.uniformMatrix4fv(this.u.proj, false, camera.projMatrix);
    gl.uniformMatrix4fv(this.u.view, false, camera.viewMatrix);
    if (this.dirty) { // uniform arah hanya diunggah saat elevasi berubah
      this.dirty = false;
      gl.uniform3f(this.u.center, this.cos * DISTANCE, this.sin * DISTANCE, 0);
      gl.uniform3f(this.u.right, 0, 0, HALF_SIZE);
      gl.uniform3f(this.u.up, -this.sin * HALF_SIZE, this.cos * HALF_SIZE, 0);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
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
