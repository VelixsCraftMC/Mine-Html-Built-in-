const DEG = Math.PI / 180;
const TWO_PI = Math.PI * 2;
const MAX_NECK_TURN = 75 * DEG;   // batas putar leher Minecraft
const DRAG_THRESHOLD = 50 * DEG;  // di atas ini badan ikut terseret
const TICK_MS = 50;               // 1 tick Minecraft = 50 ms

// Perilaku yaw badan ala Minecraft: badan diam selama kepala menoleh
// <= 75 derajat, selebihnya badan terseret. Tidak tergantung FPS.
export class BodyHelper {
  constructor() {
    this.bodyYaw = 0;
  }

  static wrapAngle(angle) {
    return angle - TWO_PI * Math.floor((angle + Math.PI) / TWO_PI);
  }

  update(headYaw, dtMs) {
    let delta = BodyHelper.wrapAngle(headYaw - this.bodyYaw);
    if (delta > MAX_NECK_TURN) delta = MAX_NECK_TURN;
    else if (delta < -MAX_NECK_TURN) delta = -MAX_NECK_TURN;
    this.bodyYaw = headYaw - delta;

    if (Math.abs(delta) > DRAG_THRESHOLD) {
      this.bodyYaw += delta * (1 - Math.pow(0.8, dtMs / TICK_MS));
    }
    return this.bodyYaw;
  }

  getYaw() {
    return this.bodyYaw;
  }
}
