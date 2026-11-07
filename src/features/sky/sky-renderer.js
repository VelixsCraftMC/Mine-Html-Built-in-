import { ShaderProgram } from "../../core/render/shader-program.js";
import { SkyShaderSource } from "./shaders/sky-glsl.js";

export class SkyRenderer {
  constructor(glContext) {
    this.ctx = glContext;
    this.gl = glContext.getGL();
    this.program = null;
    this.vao = null;
    this.vbo = null;
    this.uInvViewProjLoc = null;
    this.init();
  }

  init() {
    const gl = this.gl;
    this.program = ShaderProgram.create(gl, SkyShaderSource.vertex, SkyShaderSource.fragment);
    this.uInvViewProjLoc = gl.getUniformLocation(this.program, "u_invViewProj");

    const vertices = new Float32Array([
      -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
    ]);

    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  render(camera) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uInvViewProjLoc, false, camera.getInvViewProj());
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  dispose() {
    const gl = this.gl;
    if (gl) {
      if (this.vbo) gl.deleteBuffer(this.vbo);
      if (this.vao) gl.deleteVertexArray(this.vao);
      if (this.program) ShaderProgram.dispose(gl, this.program);
    }
    this.vbo = null;
    this.vao = null;
    this.program = null;
    this.gl = null;
  }
}