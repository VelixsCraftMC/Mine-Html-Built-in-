import { Mat4 } from "../../core/math/mat4.js";
import { ArmPose } from "./animation/arm-pose.js";
import { SneakPose } from "./animation/sneak-pose.js";
import { LegPose } from "./animation/leg-pose.js";
import { NECK_Y, BODY_BACK_Z } from "./model/model-const.js";

const DEG = Math.PI / 180;
const TWO_PI = Math.PI * 2;
const ORIGIN = [0, 0, 0];
const REST_CAPE = { pitch: 6, roll: 0 };
const CAPE_PIVOT = [0, NECK_Y, BODY_BACK_Z];
const PARTS = ["rightLeg", "leftLeg", "body", "head", "cape", "rightArm", "leftArm"];

function reset(m) {
  for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
  return m;
}

// Menghitung matriks model (dunia) dan modelView tiap bagian tanpa alokasi per frame.
// Matriks model dipakai untuk pencahayaan world-space, modelView untuk posisi layar.
export class PlayerPose {
  constructor() {
    this.model = {};
    this.modelView = {};
    for (let i = 0; i < PARTS.length; i++) {
      this.model[PARTS[i]] = Mat4.create();
      this.modelView[PARTS[i]] = Mat4.create();
    }
    this.hand = Mat4.create();
    this.base = Mat4.create(); // view * translasi posisi pemain
    this.neck = [0, NECK_Y, 0];
    this.vec = [0, 0, 0];
    this.capeVec = [0, 0, 0];
    this.origin = [0, 0, 0];
  }

  // sneak: 0..1 (jongkok), pos: posisi kaki pemain di dunia
  // cape: CapePhysics (pitch/roll derajat); tanpa itu jubah menggantung diam 6 derajat
  update(camera, bodyYaw, anim, sneak = 0, pos = ORIGIN, cape = REST_CAPE) {
    const m = this.model;
    const twist = ArmPose.update(m, anim, camera.pitch, bodyYaw, sneak);

    LegPose.update(m, bodyYaw, anim.limbPos, anim.limbSpeed, sneak);
    Mat4.rotateY(reset(m.body), m.body, -bodyYaw - twist);
    SneakPose.lean(m.body, sneak);

    // Kepala menoleh mengikuti kamera; pitch positif = menunduk
    this.neck[1] = NECK_Y - SneakPose.HEAD_DROP * sneak;
    Mat4.translate(reset(m.head), m.head, this.neck);
    Mat4.rotateY(m.head, m.head, -camera.yaw);
    Mat4.rotateX(m.head, m.head, -camera.pitch);

    Mat4.rotateY(reset(m.cape), m.cape, -bodyYaw - twist);
    Mat4.translate(m.cape, m.cape, CAPE_PIVOT);
    Mat4.translate(m.cape, m.cape, SneakPose.capeOffset(this.capeVec, sneak));
    // pitch positif = ujung bawah jubah terangkat ke belakang (+Z)
    Mat4.rotateX(m.cape, m.cape, -cape.pitch * DEG - SneakPose.CAPE_TILT * sneak);
    Mat4.rotateZ(m.cape, m.cape, cape.roll * DEG);

    Mat4.copy(this.base, camera.viewMatrix);
    const o = this.origin; // seluruh model turun 0,125 blok saat jongkok
    o[0] = pos[0]; o[1] = pos[1] - SneakPose.MODEL_DROP * sneak; o[2] = pos[2];
    Mat4.translate(this.base, this.base, o);
    for (let i = 0; i < PARTS.length; i++) {
      const k = PARTS[i];
      Mat4.multiply(this.modelView[k], this.base, m[k]);
    }
  }

  // Tangan orang pertama (ItemInHandRenderer.renderPlayerArm), progress ayunan 0..1
  updateHand(t) {
    const mv = reset(this.hand);
    const v = this.vec;
    const sq = Math.sqrt(t);
    v[0] = 0.64 - 0.3 * Math.sin(sq * Math.PI);
    v[1] = -0.6 + 0.4 * Math.sin(sq * TWO_PI);
    v[2] = -0.72 - 0.4 * Math.sin(t * Math.PI);
    Mat4.translate(mv, mv, v);
    Mat4.rotateY(mv, mv, 45 * DEG);
    Mat4.rotateY(mv, mv, Math.sin(sq * Math.PI) * 70 * DEG);
    Mat4.rotateZ(mv, mv, Math.sin(t * t * Math.PI) * -20 * DEG);

    v[0] = -1.0; v[1] = 3.6; v[2] = 3.5;
    Mat4.translate(mv, mv, v);
    Mat4.rotateZ(mv, mv, 120 * DEG);
    Mat4.rotateX(mv, mv, 200 * DEG);
    Mat4.rotateY(mv, mv, -135 * DEG);
    v[0] = 5.6; v[1] = 0; v[2] = 0;
    Mat4.translate(mv, mv, v);
    v[0] = -0.3125; v[1] = 0.125; v[2] = 0;
    Mat4.translate(mv, mv, v);
    return mv;
  }
}
