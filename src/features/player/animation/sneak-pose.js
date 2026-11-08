import { Mat4 } from "../../../core/math/mat4.js";
import { PX, NECK_Y } from "../model/model-const.js";

const v = [0, 0, 0];

// Pose jongkok Minecraft Java (HumanoidModel crouching), faktor 0..1 (1 = jongkok penuh):
// badan turun 3,2 px lalu miring 0,5 rad di leher, kepala turun 4,2 px, lengan +0,4 rad,
// seluruh model turun 2 px (PlayerRenderer.getRenderOffset). Kaki: lihat leg-pose.js.
export class SneakPose {
  static DROP = 3.2 * PX;
  static HEAD_DROP = 4.2 * PX;
  static ARM_TILT = 0.4; // tambahan ayunan lengan (rad)
  static MODEL_DROP = 0.125;  // blok
  static CAPE_DROP = 1.85 * PX;
  static CAPE_BACK = 1.4 * PX;
  static CAPE_TILT = 25 * Math.PI / 180;

  // Jubah (PlayerModel cloak y 1,85 z 1,4 + CapeLayer +25 derajat): offset pivot dan sudut tambahan
  static capeOffset(out, s) {
    out[0] = 0; out[1] = -SneakPose.CAPE_DROP * s; out[2] = SneakPose.CAPE_BACK * s;
    return out;
  }

  // Badan: turun lalu miring di leher
  static lean(m, s) {
    v[0] = 0; v[1] = -SneakPose.DROP * s; v[2] = 0;
    Mat4.translate(m, m, v);
    v[1] = NECK_Y;
    Mat4.translate(m, m, v);
    Mat4.rotateX(m, m, -0.5 * s);
    v[1] = -NECK_Y;
    Mat4.translate(m, m, v);
  }
}
