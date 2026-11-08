import { ShaderProgram } from "../../core/render/shader-program.js";
import { FullscreenQuad } from "../../core/render/fullscreen-quad.js";
import { SkyShaderSource } from "./shaders/sky-glsl.js";
import { SunRenderer } from "./sun/sun-renderer.js";
import { CloudRenderer } from "./clouds/cloud-renderer.js";

export class SkyRenderer {
  constructor(glContext) {
    this.gl = glContext.getGL();
    this.program = ShaderProgram.create(this.gl, SkyShaderSource.vertex, SkyShaderSource.fragment);
    this.uInvViewProjLoc = this.gl.getUniformLocation(this.program, "u_invViewProj");
    this.quad = FullscreenQuad.create(this.gl);
    // Lapisan langit digambar berurutan (belakang -> depan). Tiap lapisan: render(camera) dan dispose().
    // Menambah bulan/bintang cukup menambah satu entri di sini.
    this.layers = [new SunRenderer(glContext), new CloudRenderer(glContext)];
  }

  render(camera) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uInvViewProjLoc, false, camera.getInvViewProj());
    FullscreenQuad.draw(gl, this.quad);
    for (let i = 0; i < this.layers.length; i++) this.layers[i].render(camera);
  }

  dispose() {
    const gl = this.gl;
    this.layers.forEach(l => l.dispose());
    this.layers = [];
    if (gl) {
      FullscreenQuad.dispose(gl, this.quad);
      ShaderProgram.dispose(gl, this.program);
    }
    this.quad = null;
    this.program = null;
    this.gl = null;
  }
}
