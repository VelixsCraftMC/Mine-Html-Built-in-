import { MoveConfig as C } from "./config.js";

const EPS = 1e-4;
const noGround = () => 0;

// Fisika pemain berbasis waktu (bukan per frame): jalan, jongkok, lompat, terbang.
// getGround(x, y, z) -> tinggi permukaan tempat berpijak; world nanti cukup menyuplai fungsi ini.
export class PlayerPhysics {
  constructor(getGround = noGround) {
    this.getGround = getGround;
    this.prevForward = false;
  }

  update(s, input, yaw, dtMs) {
    const dt = dtMs / 1000;
    const v = s.vel;
    if (input.consumeFlyToggle()) {
      s.flying = !s.flying;
      v[1] = 0;
      if (s.flying) input.sneak = false; // sneak yang masih aktif akan langsung menurunkan pemain
    }
    s.sneaking = input.sneak;

    // Lari berhenti saat tombol maju dilepas atau jongkok (kecuali sedang terbang)
    if (input.sprint && ((this.prevForward && !input.forward) || (input.sneak && !s.flying))) input.sprint = false;
    this.prevForward = input.forward;
    s.sprinting = input.sprint && input.forward;

    // Arah input -> arah dunia (maju = (sin yaw, -cos yaw), kanan = (cos yaw, sin yaw))
    let ax = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let az = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
    const len = Math.hypot(ax, az);
    if (len > 0) { ax /= len; az /= len; }
    const sn = Math.sin(yaw), cs = Math.cos(yaw);
    const sp = s.sprinting;
    const speed = s.flying ? C.flySpeed * (sp ? C.flySprintMul : 1)
      : (s.sneaking ? C.sneakSpeed : C.walkSpeed * (sp ? C.sprintMul : 1));
    const tx = (cs * ax + sn * az) * speed;
    const tz = (sn * ax - cs * az) * speed;

    const k = s.flying ? 1 - Math.pow(C.flyDamp, dt)
      : (s.onGround ? 1 : 1 - Math.pow(C.airDamp, dt));
    v[0] += (tx - v[0]) * k;
    v[2] += (tz - v[2]) * k;

    if (s.flying) {
      const ty = (input.jump ? C.flyUpSpeed : 0) - (s.sneaking ? C.flyDownSpeed : 0);
      v[1] += (ty - v[1]) * (1 - Math.pow(C.flyDamp, dt));
    } else {
      if (s.onGround && input.jump) v[1] = C.jumpSpeed;
      v[1] = Math.max(v[1] - C.gravity * dt, -C.terminalSpeed);
    }

    const p = s.pos;
    p[0] += v[0] * dt; p[1] += v[1] * dt; p[2] += v[2] * dt;

    const gy = this.getGround(p[0], p[1], p[2]);
    if (p[1] <= gy) {
      p[1] = gy;
      if (v[1] < 0 || !s.flying) { v[1] = 0; s.flying = false; } // mendarat = berhenti terbang
    }
    s.onGround = !s.flying && p[1] <= gy + EPS;
    s.moving = len > 0;

    // Tinggi mata jongkok halus (setengah jalan tiap 50 ms); pose model berganti seketika seperti Java
    s.crouch = s.sneaking && !s.flying;
    const target = s.crouch ? 1 : 0;
    s.sneakAmt += (target - s.sneakAmt) * (1 - Math.pow(0.5, dtMs / 50));
    s.eye = C.eyeHeight - C.sneakEyeDrop * s.sneakAmt;
  }
}
