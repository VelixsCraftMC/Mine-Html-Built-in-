export class BodyHelper {
  constructor() {
    this.bodyYaw = 0;
  }

  // Normalisasi sudut ke rentang [-PI, +PI] (MathHelper.wrapDegrees)
  static wrapAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  update(headYaw) {
    let delta = BodyHelper.wrapAngle(headYaw - this.bodyYaw);

    // Batas putaran leher Minecraft: 75 derajat (1.3089 rad)
    const maxNeckTurn = (75.0 * Math.PI) / 180.0;
    if (delta < -maxNeckTurn) {
      this.bodyYaw = headYaw + maxNeckTurn;
      delta = -maxNeckTurn;
    } else if (delta > maxNeckTurn) {
      this.bodyYaw = headYaw - maxNeckTurn;
      delta = maxNeckTurn;
    }

    // Tubuh berputar perlahan mengikuti kepala (0.08 per frame)
    this.bodyYaw += delta * 0.08;
    return this.bodyYaw;
  }

  getYaw() {
    return this.bodyYaw;
  }
}