import { ShaderProgram } from "../../core/render/shader-program.js";
import { TextureLoader } from "../../core/render/texture-loader.js";
import { MeshVao } from "../../core/render/mesh-vao.js";
import { GeoParser } from "./model/geo-parser.js";
import { BoneMesh } from "./model/bone-mesh.js";
import { CapeMesh } from "./model/cape-mesh.js";
import { BodyHelper } from "./model/body-helper.js";
import { PlayerPose } from "./player-pose.js";
import { PlayerAnimator } from "./animation/player-animator.js";
import { CapePhysics } from "./animation/cape-physics.js";
import { PlayerShaderSource } from "./shaders/player-glsl.js";
import { PerspectiveMode } from "../camera/camera.js";
import { Mat4 } from "../../core/math/mat4.js";
import { Options } from "../../core/options/options.js";

// [nama bone, relatif pivot?] - bagian yang bergerak dipisah agar bisa dianimasikan
const BONES = {
  body: [["Body"], false],
  rightLeg: [["Right Leg"], true],
  leftLeg: [["Left Leg"], true],
  rightArm: [["Right Arm"], true],
  leftArm: [["Left Arm"], true],
  head: [["Head"], true]
};

export class PlayerRenderer {
  // opt: hasil Options.load() (skinPath, capePath); tanpa itu memakai default
  constructor(glContext, opt = Options.defaults()) {
    this.gl = glContext.getGL();
    this.opt = opt;
    this.program = null;
    this.u = null;
    this.meshes = {};
    this.skinTex = null;
    this.capeTex = null;
    this.bodyHelper = new BodyHelper();
    this.pose = new PlayerPose();
    this.animator = new PlayerAnimator();
    this.cape = new CapePhysics();
    this.handTmp = Mat4.create();
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

    const def = Options.defaults(); // skin/jubah cadangan bila file pilihan gagal dimuat
    this.skinTex = TextureLoader.load(gl, this.opt.skinPath, def.skinPath);
    this.capeTex = this.opt.capePath ? TextureLoader.load(gl, this.opt.capePath, def.capePath) : null;
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
    if (!mesh || !tex) return; // tex null = bagian tidak dipakai (mis. tanpa jubah)
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniformMatrix4fv(this.u.mv, false, mv);
    gl.uniformMatrix4fv(this.u.nm, false, nm);
    MeshVao.draw(gl, mesh);
  }

  // actions (opsional): objek dengan consumeAttack() dan isMining()
  // state (opsional): PlayerState (pos, vel, crouch, moving, bob)
  render(camera, actions, state = null) {
    if (!this.program) return;
    const gl = this.gl;
    const now = performance.now();
    const dt = Math.min(now - this.lastTime, 100);
    this.lastTime = now;
    const dist = state ? Math.hypot(state.vel[0], state.vel[2]) * dt / 1000 : 0;
    this.animator.update(dt, actions, dist);
    // Badan selalu diperbarui, termasuk saat orang pertama, seperti Minecraft
    // Memukul atau bergerak: badan menyusul arah kepala
    const follow = this.animator.swinging || (state !== null && state.moving);
    const bodyYaw = this.bodyHelper.update(camera.yaw, dt, follow);

    if (state) this.cape.update(state.pos, bodyYaw, state.walkDist, state.bobAmt, dt);

    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniformMatrix4fv(this.u.proj, false, camera.projMatrix);

    const mesh = this.meshes, skin = this.skinTex;
    if (camera.mode === PerspectiveMode.FIRST_PERSON) {
      let h = this.pose.updateHand(this.animator.swingProgress);
      if (state) { // tangan ikut view bobbing
        Mat4.multiply(this.handTmp, state.bob, h);
        h = this.handTmp;
      }
      this.draw(mesh.arm, skin, h, h);
    } else {
      this.pose.update(camera, bodyYaw, this.animator, state && state.crouch ? 1 : 0, state ? state.pos : undefined, this.cape);
      const m = this.pose.model, mv = this.pose.modelView;
      this.draw(mesh.rightLeg, skin, mv.rightLeg, m.rightLeg);
      this.draw(mesh.leftLeg, skin, mv.leftLeg, m.leftLeg);
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
