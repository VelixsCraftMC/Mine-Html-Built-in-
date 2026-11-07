import { ShaderProgram } from "../../core/render/shader-program.js";
import { TextureLoader } from "../../core/render/texture-loader.js";
import { GeoParser } from "./model/geo-parser.js";
import { HeadMesh } from "./model/head-mesh.js";
import { BodyMesh } from "./model/body-mesh.js";
import { CapeMesh } from "./model/cape-mesh.js";
import { BodyHelper } from "./model/body-helper.js";
import { PlayerShaderSource } from "./shaders/player-glsl.js";
import { PerspectiveMode } from "../camera/camera.js";
import { Mat4 } from "../../core/math/mat4.js";

export class PlayerRenderer {
  constructor(glContext) {
    this.gl = glContext.getGL();
    this.program = null;
    this.armVao = null; this.armCount = 0;
    this.headVao = null; this.headCount = 0;
    this.bodyVao = null; this.bodyCount = 0;
    this.capeVao = null; this.capeCount = 0;
    this.skinTex = null; this.capeTex = null;
    this.bodyHelper = new BodyHelper();
    // Buffer matriks mandiri agar tidak terjadi memory corruption
    this.mvBody = Mat4.create();
    this.mvHead = Mat4.create();
    this.mvCape = Mat4.create();
    this.mvHand = Mat4.create();
    this.init();
  }

  async init() {
    const gl = this.gl;
    this.program = ShaderProgram.create(gl, PlayerShaderSource.vertex, PlayerShaderSource.fragment);
    this.skinTex = TextureLoader.load(gl, "assets/skins/steve.png");
    this.capeTex = TextureLoader.load(gl, "assets/cape/mojang_cape.png");

    this.capeVao = this.createVao(CapeMesh.build(), c => this.capeCount = c);
    try {
      const res = await fetch("assets/models/player/wide.geo.json");
      const geo = await res.json();
      this.armVao = this.createVao(GeoParser.extractBoneCubes(geo, "Right Arm"), c => this.armCount = c);
      this.headVao = this.createVao(HeadMesh.build(geo), c => this.headCount = c);
      this.bodyVao = this.createVao(BodyMesh.build(geo), c => this.bodyCount = c);
    } catch (_) {}
  }

  createVao(mesh, setCount) {
    if (!mesh) return null;
    const gl = this.gl;
    setCount(mesh.positions.length / 3);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    [{ loc: 0, s: 3, d: mesh.positions }, { loc: 1, s: 2, d: mesh.uvs }, { loc: 2, s: 3, d: mesh.normals }].forEach(b => {
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, b.d, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(b.loc);
      gl.vertexAttribPointer(b.loc, b.s, gl.FLOAT, false, 0, 0);
    });
    gl.bindVertexArray(null);
    return vao;
  }

  render(camera) {
    if (!this.program) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    const uProj = gl.getUniformLocation(this.program, "u_projection");
    const uMv = gl.getUniformLocation(this.program, "u_modelView");
    const uTex = gl.getUniformLocation(this.program, "u_texture");
    gl.uniformMatrix4fv(uProj, false, camera.projMatrix);

    if (camera.mode === PerspectiveMode.FIRST_PERSON) {
      if (!this.armVao) return;
      const mv = this.mvHand;
      for (let i = 0; i < 16; i++) mv[i] = (i % 5 === 0) ? 1 : 0;
      Mat4.translate(mv, mv, [0.64, -0.60, -0.72]);
      Mat4.rotateY(mv, mv, (45.0 * Math.PI) / 180.0);
      Mat4.translate(mv, mv, [-1.0, 3.6, 3.5]);
      Mat4.rotateZ(mv, mv, (120.0 * Math.PI) / 180.0);
      Mat4.rotateX(mv, mv, (200.0 * Math.PI) / 180.0);
      Mat4.rotateY(mv, mv, (-135.0 * Math.PI) / 180.0);
      Mat4.translate(mv, mv, [5.6, 0.0, 0.0]);
      Mat4.translate(mv, mv, [-0.3125, 0.125, 0.0]);

      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.skinTex);
      gl.uniform1i(uTex, 0); gl.uniformMatrix4fv(uMv, false, mv);
      gl.bindVertexArray(this.armVao); gl.drawArrays(gl.TRIANGLES, 0, this.armCount);
    } else {
      const bodyYaw = this.bodyHelper.update(camera.yaw);

      // 1. Badan & Kaki (Tegak berdiri Y = 0 s/d 1.5 meter)
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.skinTex);
      gl.uniform1i(uTex, 0);
      if (this.bodyVao) {
        Mat4.rotateY(this.mvBody, camera.viewMatrix, -bodyYaw);
        gl.uniformMatrix4fv(uMv, false, this.mvBody);
        gl.bindVertexArray(this.bodyVao); gl.drawArrays(gl.TRIANGLES, 0, this.bodyCount);
      }

      // 2. Jubah Mojang (Tergantung di punggung atas Y = 1.45, Z = 0.125)
      if (this.capeVao) {
        Mat4.rotateY(this.mvCape, camera.viewMatrix, -bodyYaw);
        Mat4.translate(this.mvCape, this.mvCape, [0, 1.45, 0.125]);
        Mat4.rotateX(this.mvCape, this.mvCape, (12.0 * Math.PI) / 180.0);
        gl.bindTexture(gl.TEXTURE_2D, this.capeTex);
        gl.uniformMatrix4fv(uMv, false, this.mvCape);
        gl.bindVertexArray(this.capeVao); gl.drawArrays(gl.TRIANGLES, 0, this.capeCount);
      }

      // 3. Kepala (Tegak di atas leher Y = 1.5, menoleh mengikuti kamera)
      if (this.headVao) {
        Mat4.translate(this.mvHead, camera.viewMatrix, [0, 1.5, 0]);
        Mat4.rotateY(this.mvHead, this.mvHead, -camera.yaw);
        Mat4.rotateX(this.mvHead, this.mvHead, camera.pitch);
        gl.bindTexture(gl.TEXTURE_2D, this.skinTex);
        gl.uniformMatrix4fv(uMv, false, this.mvHead);
        gl.bindVertexArray(this.headVao); gl.drawArrays(gl.TRIANGLES, 0, this.headCount);
      }
    }
    gl.bindVertexArray(null);
  }

  dispose() {
    const gl = this.gl;
    if (gl) {
      [this.armVao, this.headVao, this.bodyVao, this.capeVao].forEach(v => v && gl.deleteVertexArray(v));
      TextureLoader.dispose(gl, this.skinTex);
      TextureLoader.dispose(gl, this.capeTex);
      ShaderProgram.dispose(gl, this.program);
    }
  }
}