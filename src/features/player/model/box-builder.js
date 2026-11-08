import { PX } from "./model-const.js";

// Pembangun kotak universal (layout UV Minecraft Java/Bedrock).
// Konvensi: pemain menghadap -Z, sisi "Right" karakter berada di +X.
export class BoxBuilder {
  static create() {
    return { pos: [], uvs: [], norm: [] };
  }

  // Kubus Bedrock relatif terhadap pivot -> sumbu X dicerminkan agar bone "Right" berada di +X
  static addBedrockCube(out, c, pivot, tw, th) {
    const inf = c.inflate || 0;
    const [ox, oy, oz] = c.origin;
    const [w, h, d] = c.size;
    const [px, py, pz] = pivot;
    this.addBox(
      out,
      -(ox + w + inf - px) * PX, (oy - inf - py) * PX, (oz - inf - pz) * PX,
      -(ox - inf - px) * PX, (oy + h + inf - py) * PX, (oz + d + inf - pz) * PX,
      c.uv[0], c.uv[1], w, h, d, tw, th
    );
  }

  static addBox(out, x0, y0, z0, x1, y1, z1, u, v, w, h, d, tw, th) {
    // [normal, 4 titik (kiri-bawah, kanan-bawah, kanan-atas, kiri-atas dari luar), u, v, lebar, tinggi]
    const faces = [
      [[0, 0, -1], [x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], u + d, v + d, w, h],
      [[0, 0, 1], [x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], u + 2 * d + w, v + d, w, h],
      [[1, 0, 0], [x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1], u, v + d, d, h],
      [[-1, 0, 0], [x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0], u + d + w, v + d, d, h],
      [[0, 1, 0], [x1, y1, z0, x0, y1, z0, x0, y1, z1, x1, y1, z1], u + d, v, w, d],
      [[0, -1, 0], [x1, y0, z1, x0, y0, z1, x0, y0, z0, x1, y0, z0], u + d + w, v, w, d]
    ];
    for (const [n, p, fu, fv, fw, fh] of faces) {
      this.addQuad(out, n, p, fu / tw, fv / th, fw / tw, fh / th);
    }
  }

  static addQuad(out, n, p, u0, v0, uw, vh) {
    const uv = [u0, v0 + vh, u0 + uw, v0 + vh, u0 + uw, v0, u0, v0];
    for (const i of [0, 1, 2, 0, 2, 3]) {
      out.pos.push(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
      out.norm.push(n[0], n[1], n[2]);
      out.uvs.push(uv[i * 2], uv[i * 2 + 1]);
    }
  }

  static finish(out) {
    return {
      positions: new Float32Array(out.pos),
      uvs: new Float32Array(out.uvs),
      normals: new Float32Array(out.norm)
    };
  }
}
