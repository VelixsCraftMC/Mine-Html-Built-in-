import { Mat4 } from "../../core/math/mat4.js";

const DEG = Math.PI / 180;
const TICK_MS = 50;
const MAX_BOB = 0.1;
const STEP_SCALE = 0.6;
const vec = [0, 0, 0];

// Port GameRenderer.bobView (Minecraft Java). Hasilnya matriks di ruang kamera
// yang dikalikan ke view orang pertama dan ke matriks tangan.
export class ViewBob {
  static update(s, dtMs) {
    const p = s.vel;
    const dist = Math.hypot(p[0], p[2]) * dtMs / 1000;       // jarak horizontal frame ini
    s.walkDist += dist * STEP_SCALE;

    const perTick = dtMs > 0 ? dist * TICK_MS / dtMs : 0;
    const target = s.onGround ? Math.min(MAX_BOB, perTick) : 0;
    s.bobAmt += (target - s.bobAmt) * (1 - Math.pow(0.6, dtMs / TICK_MS));

    const f = -s.walkDist * Math.PI;
    const b = s.bobAmt;
    const m = s.bob;
    for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
    vec[0] = Math.sin(f) * b * 0.5;
    vec[1] = -Math.abs(Math.cos(f) * b);
    Mat4.translate(m, m, vec);
    Mat4.rotateZ(m, m, Math.sin(f) * b * 3 * DEG);
    Mat4.rotateX(m, m, Math.abs(Math.cos(f - 0.2) * b) * 5 * DEG);
  }
}
