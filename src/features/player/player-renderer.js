import { ShaderProgram } from "../../core/render/shader-program.js";
import { TextureLoader } from "../../core/render/texture-loader.js";
import { MeshVao } from "../../core/render/mesh-vao.js";
import { GeoParser } from "./model/geo-parser.js";
import { BoneMesh } from "./model/bone-mesh.js";
import { CapeMesh } from "./model/cape-mesh.js";
import { BodyHelper } from "./model/body-helper.js";
import { PlayerPose } from "./player-pose.js";
import { PlayerAnimator } from "./animation/player-animator.js";
import { PlayerShaderSource } from "./shaders/player-glsl.js";
import { PerspectiveMode } from "../camera/camera.js";

// [nama bone, relatif pivot?] - bagian yang bergerak dipisah agar bisa dianimasikan
const BONES = {
  body: [["Body"], false],
  legs: [["Right Leg", "Left Leg"], false],
  rightArm: [["Right Arm"], true],
  leftArm: [["Left Arm"], true],
  head: [["Head"], true]
};

export class PlayerRenderer {
  constructor(glContext) {
    this.gl = glContext.getGL();
    this.program = null;
    this.u = null;
    this.meshes = {};
    this.skinTex = null;
    this.capeTex = null;
    this.bodyHelper = new BodyHelper();
    this.pose = new PlayerPose();
    this.animator = new PlayerAnimator();
    this.lastTime = performance.now();
    this.disposed = false;
    this.init();
  }

  init() {
    const gl = this.gl;
    this.program = ShaderProgram.create(gl, PlayerShaderSource.vertex, PlayerShaderSource.fragment);
    // Lokasi uniform di-cache sekali, bukan dicari setiap frame
    this.u = {
      proj: gl.getUniformLocation(this.program, "u_projection"),
      mv: gl.getUniformLocation(this.program, "u_modelView"),
      nm: gl.getUniformLocation(this.program, "u_normalMatrix"),
      tex: gl.getUniformLocation(this.program, "u_texture")
    };
    gl.useProgram(this.program);
    gl.uniform1i(this.u.tex, 0);

    this.skinTex = TextureLoader.load(gl, "assets/skins/steve.png");
    this.capeTex = TextureLoader.load(gl, "assets/cape/cape.png");
    this.meshes.cape = MeshVao.create(gl, CapeMesh.build());
    this.loadGeometry();
  }

  async loadGeometry() {
    try {
      const res = await fetch("assets/models/player/wide.geo.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const geo = await res.json();
      if (this.disposed) return;
      const gl = this.gl, m = this.meshes;
      m.arm = MeshVao.create(gl, GeoParser.extractBoneCubes(geo, "Right Arm"));
      for (const key of Object.keys(BONES)) {
        const [names, rel] = BONES[key];
        m[key] = MeshVao.create(gl, BoneMesh.build(geo, names, rel));
      }
    } catch (err) {
      console.warn("[PlayerRenderer] Model pemain gagal dimuat:", err);
    }
  }

  draw(mesh, tex, mv, nm) {
    if (!mesh) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniformMatrix4fv(this.u.mv, false, mv);
    gl.uniformMatrix4fv(this.u.nm, false, nm);
    MeshVao.draw(gl, mesh);
  }

  // actions (opsional): objek dengan consumeAttack() dan isMining()
  render(camera, actions) {
    if (!this.program) return;
    const gl = this.gl;
    const now = performance.now();
    const dt = Math.min(now - this.lastTime, 100);
    this.lastTime = now;
    this.animator.update(dt, actions);
    // Badan selalu diperbarui, termasuk saat orang pertama, seperti Minecraft
    const bodyYaw = this.bodyHelper.update(camera.yaw, dt);

    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniformMatrix4fv(this.u.proj, false, camera.projMatrix);

    const mesh = this.meshes, skin = this.skinTex;
    if (camera.mode === PerspectiveMode.FIRST_PERSON) {
      const h = this.pose.updateHand(this.animator.swingProgress);
      this.draw(mesh.arm, skin, h, h);
    } else {
      this.pose.update(camera, bodyYaw, this.animator);
      const m = this.pose.model, mv = this.pose.modelView;
      this.draw(mesh.legs, skin, mv.legs, m.legs);
      this.draw(mesh.body, skin, mv.body, m.body);
      this.draw(mesh.rightArm, skin, mv.rightArm, m.rightArm);
      this.draw(mesh.leftArm, skin, mv.leftArm, m.leftArm);
      this.draw(mesh.cape, this.capeTex, mv.cape, m.cape);
      this.draw(mesh.head, skin, mv.head, m.head);
    }
    gl.bindVertexArray(null);
  }

  dispose() {
    this.disposed = true;
    const gl = this.gl;
    if (gl) {
      Object.values(this.meshes).forEach(m => MeshVao.dispose(gl, m));
      TextureLoader.dispose(gl, this.skinTex);
      TextureLoader.dispose(gl, this.capeTex);
      ShaderProgram.dispose(gl, this.program);
    }
    this.meshes = {};
    this.program = null;
    this.gl = null;
  }
}
