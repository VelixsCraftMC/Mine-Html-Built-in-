import { Mat4 } from "../../../core/math/mat4.js";
import { PX } from "../model/model-const.js";

const HIP_X = 1.9 * PX;
const HIP_Y = 12 * PX;
const CROUCH_Z = 3.9 * PX; // kaki bergeser ke belakang saat jongkok (Java: z 0,1 -> 4)
const pos = [0, 0, 0];

function reset(m) {
  for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
  return m;
}

// Port HumanoidModel.setupAnim untuk kaki: kaki kanan dan kiri berayun berlawanan fase.
export class LegPose {
  static update(m, bodyYaw, limbPos, limbSpeed, sneak) {
    const swing = Math.cos(limbPos * 0.6662) * 1.4 * limbSpeed;
    LegPose.place(m.rightLeg, bodyYaw, 1, swing, sneak);
    LegPose.place(m.leftLeg, bodyYaw, -1, -swing, sneak);
  }

  // side: +1 kaki kanan (+X), -1 kaki kiri (-X); xRot dalam konvensi Java
  static place(out, bodyYaw, side, xRot, sneak) {
    reset(out);
    Mat4.rotateY(out, out, -bodyYaw);
    pos[0] = side * HIP_X; pos[1] = HIP_Y; pos[2] = CROUCH_Z * sneak;
    Mat4.translate(out, out, pos);
    Mat4.rotateX(out, out, -xRot);
  }
}
