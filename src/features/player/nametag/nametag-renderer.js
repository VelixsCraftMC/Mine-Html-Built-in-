import { ShaderProgram } from "../../../shaders/RenderVulkan/shader-program.js";
import { PerspectiveMode } from "../../camera/camera.js";
import { ShaderPack } from "../../../shaders/shader-pack.js";
import { NametagTexture } from "./nametag-texture.js";

const LABEL_HEIGHT = 0.25; // tinggi label (blok)
const LABEL_Y = 2.2;       // pusat label di atas telapak kaki (kepala ~1,9)
const SNEAK_DROP = 0.125;  // turun saat jongkok, sama dengan model pemain
const CORNERS = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);

// Nama hanya tampil di orang kedua (depan) dan orang ketiga (belakang), bukan orang pertama.
export class NametagRenderer {
  constructor(glContext, name) {
    this.gl = glContext.getGL();
    const gl = this.gl;
    this.program = ShaderPack.create(gl, "nametag");
    this.u = {
      proj: gl.getUniformLocation(this.program, "u_projection"),
      center: gl.getUniformLocation(this.program, "u_center"),
      size: gl.getUniformLocation(this.program, "u_size"),
      tex: gl.getUniformLocation(this.program, "u_texture")
    };
    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, CORNERS, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.label = new NametagTexture(gl);
    this.label.setText(name);
  }

  setName(name) {
    if (this.label) this.label.setText(name);
  }

  // state: PlayerState (pos, sneakAmt)
  render(camera, state) {
    if (!this.program || camera.mode === PerspectiveMode.FIRST_PERSON) return;
    const gl = this.gl, v = camera.viewMatrix, p = state.pos;
    const x = p[0], y = p[1] + LABEL_Y - SNEAK_DROP * state.sneakAmt, z = p[2];

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.label.texture);
    gl.uniform1i(this.u.tex, 0);
    gl.uniformMatrix4fv(this.u.proj, false, camera.projMatrix);
    gl.uniform3f(this.u.center,
      v[0] * x + v[4] * y + v[8] * z + v[12],
      v[1] * x + v[5] * y + v[9] * z + v[13],
      v[2] * x + v[6] * y + v[10] * z + v[14]);
    gl.uniform2f(this.u.size, LABEL_HEIGHT * this.label.aspect, LABEL_HEIGHT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false); // latar transparan tidak boleh menutup objek di belakangnya
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
  }

  dispose() {
    const gl = this.gl;
    if (gl) {
      gl.deleteBuffer(this.vbo);
      gl.deleteVertexArray(this.vao);
      ShaderProgram.dispose(gl, this.program);
    }
    if (this.label) this.label.dispose();
    this.label = this.program = this.gl = null;
  }
}
