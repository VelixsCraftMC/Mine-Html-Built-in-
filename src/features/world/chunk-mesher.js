import { FACES } from "./face-table.js";
import { CHUNK } from "./chunk.js";
import { DIRS } from "../block/model-store.js";

export const FLOATS = 13; // pos3 uv2 overlayUv2 warna3 warnaOverlay3
const WHITE = [1, 1, 1];

// Buffer kerja dipakai ulang antar chunk (tanpa alokasi per mesh); hasil disalin sekali ke ukuran pas.
let verts = new Float32Array(FLOATS * 4 * 1024);
let idx = new Uint32Array(6 * 1024);

function grow(quads) {
  if (verts.length >= quads * 4 * FLOATS) return;
  const v = new Float32Array(Math.max(verts.length * 2, quads * 4 * FLOATS));
  const i = new Uint32Array(v.length / FLOATS / 4 * 6);
  v.set(verts); i.set(idx);
  verts = v; idx = i;
}

export class ChunkMesher {
  // -> { verts: Float32Array, idx: Uint32Array, quads } atau null bila chunk tidak punya sisi terlihat
  // tint: [r,g,b] warna biome. atlas harus sudah freeze().
  static build(world, chunk, atlas, tint) {
    const reg = world.reg, d = chunk.data, ox = chunk.cx * CHUNK, oz = chunk.cz * CHUNK;
    let q = 0;
    // id tetangga: di dalam chunk baca langsung; di luar lewat world (-1 = belum dimuat -> dianggap tertutup)
    const at = (x, y, z) => {
      if (y < 0) return -1;
      if (y >= chunk.height) return 0;
      if (x >= 0 && x < CHUNK && z >= 0 && z < CHUNK) return d[(y * CHUNK + z) * CHUNK + x];
      return world.getBlock(ox + x, y, oz + z);
    };
    for (let y = 0; y < chunk.top; y++) {
      for (let z = 0; z < CHUNK; z++) {
        for (let x = 0; x < CHUNK; x++) {
          const id = d[(y * CHUNK + z) * CHUNK + x];
          if (id === 0) continue;
          const def = reg.at(id);
          if (!def.visible) continue;
          for (const cube of def.model.cubes) {
            for (let f = 0; f < 6; f++) {
              const n = FACES[f].n, flush = n[0] + n[1] + n[2] > 0 ? 1 : 0;
              const axis = n[0] !== 0 ? 0 : n[1] !== 0 ? 1 : 2;
              if ((flush ? cube.max[axis] : cube.min[axis]) === flush) { // sisi rata dengan tepi blok -> bisa tertutup
                const nid = at(x + n[0], y + n[1], z + n[2]);
                if (nid < 0 || reg.at(nid).opaque) continue;
              }
              grow(q + 1);
              ChunkMesher.quad(q++, x, y, z, cube, f, def.faces[f], atlas, tint);
            }
          }
        }
      }
    }
    if (!q) return null;
    return { verts: verts.slice(0, q * 4 * FLOATS), idx: idx.slice(0, q * 6), quads: q };
  }

  static quad(q, x, y, z, cube, f, face, atlas, tint) {
    const F = FACES[f], uv = cube.uv && cube.uv[DIRS[f]];
    const r = atlas.rect(face.tex), o = face.ov >= 0 ? atlas.rect(face.ov) : null;
    const sub = uv || [0, 0, 1, 1];
    const cb = face.tintBase ? tint : WHITE, co = face.tintOv ? tint : WHITE, s = F.shade;
    for (let k = 0; k < 4; k++) {
      const c = F.c[k], i = (q * 4 + k) * FLOATS;
      verts[i] = x + (c[0] ? cube.max[0] : cube.min[0]);
      verts[i + 1] = y + (c[1] ? cube.max[1] : cube.min[1]);
      verts[i + 2] = z + (c[2] ? cube.max[2] : cube.min[2]);
      const fu = sub[0] + (sub[2] - sub[0]) * c[3], fv = sub[1] + (sub[3] - sub[1]) * c[4];
      verts[i + 3] = r[0] + (r[2] - r[0]) * fu;
      verts[i + 4] = r[1] + (r[3] - r[1]) * fv;
      verts[i + 5] = o ? o[0] + (o[2] - o[0]) * fu : -1;
      verts[i + 6] = o ? o[1] + (o[3] - o[1]) * fv : -1;
      verts[i + 7] = cb[0] * s; verts[i + 8] = cb[1] * s; verts[i + 9] = cb[2] * s;
      verts[i + 10] = co[0] * s; verts[i + 11] = co[1] * s; verts[i + 12] = co[2] * s;
    }
    const b = q * 4, j = q * 6;
    idx[j] = b; idx[j + 1] = b + 1; idx[j + 2] = b + 2;
    idx[j + 3] = b; idx[j + 4] = b + 2; idx[j + 5] = b + 3;
  }
}
