import { Mat4 } from "../../../core/math/mat4.js";
import { PX } from "../model/model-const.js";
import { SneakPose } from "./sneak-pose.js";

const TWO_PI = Math.PI * 2;
const SHOULDER_Y = 22 * PX;
const SHOULDER_X = 5 * PX;
const pos = [0, 0, 0];

function reset(m) {
  for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
  return m;
}

// Port HumanoidModel.setupAttackAnim + AnimationUtils.bobModelPart (Minecraft Java).
// Sudut Java dikonversi ke ruang kita (Y atas, menghadap -Z): z tetap, x dan y dibalik.
export class ArmPose {
  // Mengisi m.rightArm & m.leftArm, mengembalikan putaran badan (twist) saat memukul
  static update(m, anim, headPitch, bodyYaw, sneak = 0) {
    const t = anim.swingProgress;
    const age = anim.age;
    const twist = t > 0 ? Math.sin(Math.sqrt(t) * TWO_PI) * 0.2 : 0;

    // Napas idle: lengan bergoyang pelan
    const bobZ = Math.cos(age * 0.09) * 0.05 + 0.05;
    const bobX = Math.sin(age * 0.067) * 0.05;

    let f = 1 - t;
    f *= f;
    f *= f;
    f = 1 - f;
    const f1 = Math.sin(f * Math.PI);
    const f2 = Math.sin(t * Math.PI) * -(headPitch - 0.7) * 0.75;

    const tilt = SneakPose.ARM_TILT * sneak; // jongkok: lengan ikut condong
    const drop = SneakPose.DROP * sneak;
    // Ayunan jalan (Java): kanan = -cos, kiri = +cos, amplitudo = limbSpeed
    const walk = Math.cos(anim.limbPos * 0.6662) * anim.limbSpeed;
    const rx = bobX - (f1 * 1.2 + f2) + tilt - walk;
    const rz = bobZ + Math.sin(t * Math.PI) * -0.4;
    ArmPose.place(m.rightArm, bodyYaw, twist, 1, rx, twist * 3, rz, drop);
    ArmPose.place(m.leftArm, bodyYaw, twist, -1, twist - bobX + tilt + walk, twist, -bobZ, drop);
    return twist;
  }

  // side: +1 lengan kanan (+X), -1 lengan kiri (-X)
  static place(out, bodyYaw, twist, side, rx, ry, rz, drop = 0) {
    reset(out);
    Mat4.rotateY(out, out, -bodyYaw);
    pos[0] = side * Math.cos(twist) * SHOULDER_X;
    pos[1] = SHOULDER_Y - drop;
    pos[2] = side * Math.sin(twist) * SHOULDER_X;
    Mat4.translate(out, out, pos);
    Mat4.rotateZ(out, out, rz);
    Mat4.rotateY(out, out, -ry);
    Mat4.rotateX(out, out, -rx);
  }
}
