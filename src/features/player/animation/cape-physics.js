const DEG = Math.PI / 180;
const TICK_MS = 50;
const CHASE = 0.25;          // jubah mengejar pemain 25% per tick (Player.moveCloak)
const TELEPORT = 10;

function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

// Fisika jubah ala Minecraft Java (Player.moveCloak + CapeLayer). Jubah tertinggal di belakang
// posisi pemain; selisihnya menentukan seberapa jauh jubah terangkat (pitch) dan miring (roll).
// Hasil: pitch (derajat, sudah termasuk 6 derajat dasar), roll (derajat).
export class CapePhysics {
  constructor() {
    this.c = [0, 0, 0];
    this.init = false;
    this.pitch = 6;
    this.roll = 0;
  }

  // pos = posisi kaki pemain, bodyYaw dalam radian (konvensi kamera kita), walkDist/bob dari PlayerState
  update(pos, bodyYaw, walkDist, bob, dtMs) {
    const c = this.c;
    if (!this.init || Math.abs(pos[0] - c[0]) > TELEPORT || Math.abs(pos[2] - c[2]) > TELEPORT) {
      c[0] = pos[0]; c[1] = pos[1]; c[2] = pos[2];
      this.init = true;
    }
    const k = 1 - Math.pow(1 - CHASE, dtMs / TICK_MS);
    c[0] += (pos[0] - c[0]) * k;
    c[1] += (pos[1] - c[1]) * k;
    c[2] += (pos[2] - c[2]) * k;

    const dx = c[0] - pos[0], dy = c[1] - pos[1], dz = c[2] - pos[2];
    const sn = Math.sin(bodyYaw), cs = Math.cos(bodyYaw);
    // maju badan = (sin, -cos), kanan badan = (cos, sin)
    const back = clamp(-(dx * sn - dz * cs) * 100, 0, 150);
    const side = clamp((dx * cs + dz * sn) * 100, -20, 20);
    let lift = clamp(dy * 10, -6, 32);
    lift += Math.sin(walkDist * 6) * 32 * bob;

    this.pitch = 6 + back / 2 + lift;
    this.roll = side / 2;
  }
}
