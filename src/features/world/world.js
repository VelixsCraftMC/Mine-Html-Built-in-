import { Chunk, CHUNK } from "./chunk.js";
import { ChunkStream } from "./chunk-stream.js";
import { Generators } from "./generators/index.js";
import { TransformScheduler } from "./transform-scheduler.js";

const keyOf = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);

// Dunia: kumpulan chunk + generator dari dimension JSON. Tidak tahu apa pun soal GL.
export class World {
  constructor(registry, dim) {
    this.reg = registry;
    this.dim = dim;
    this.height = dim.height;
    this.chunks = new Map();
    this.dirty = new Set();  // chunk yang meshnya perlu dibangun ulang
    this.sched = new TransformScheduler();
    this.stream = new ChunkStream(dim.renderDistance + 1);
    this.gen = Generators.get(dim.generator.type).create(dim.generator, registry, dim.height);
    this.surface = this.gen.surface;
    this.onUnload = null;    // callback(chunk): renderer melepas mesh GPU
  }

  has(cx, cz) { return this.chunks.has(keyOf(cx, cz)); }
  defAt(x, y, z) { return this.reg.at(this.getBlock(x, y, z)); }

  // id numerik; 0 di luar tinggi dunia; -1 bila chunk belum dimuat
  getBlock(x, y, z) {
    if (y < 0 || y >= this.height) return 0;
    const c = this.chunks.get(keyOf(x >> 4, z >> 4));
    return c ? c.data[(y * CHUNK + (z & 15)) * CHUNK + (x & 15)] : -1;
  }

  setBlock(x, y, z, id) {
    const c = this.chunks.get(keyOf(x >> 4, z >> 4));
    if (!c || y < 0 || y >= this.height || id < 0 || id >= this.reg.size) return false;
    const lx = x & 15, lz = z & 15;
    if (c.get(lx, y, lz) === id) return false;
    c.set(lx, y, lz, id);
    c.modified = true;
    this.markDirty(c);
    if (lx === 0) this.markDirty(this.chunks.get(keyOf(c.cx - 1, c.cz)));
    if (lx === 15) this.markDirty(this.chunks.get(keyOf(c.cx + 1, c.cz)));
    if (lz === 0) this.markDirty(this.chunks.get(keyOf(c.cx, c.cz - 1)));
    if (lz === 15) this.markDirty(this.chunks.get(keyOf(c.cx, c.cz + 1)));
    this.sched.onChange(this, x, y, z);
    return true;
  }

  markDirty(c) { if (c) this.dirty.add(c); }

  load(cx, cz) {
    if (this.has(cx, cz)) return;
    const c = new Chunk(cx, cz, this.height);
    this.gen.fill(c);
    this.chunks.set(keyOf(cx, cz), c);
    this.markDirty(c); // tetangga ikut: sisi yang tadinya menghadap chunk kosong kini perlu dihitung ulang
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => this.markDirty(this.chunks.get(keyOf(cx + dx, cz + dz))));
  }

  unload(c) {
    this.chunks.delete(keyOf(c.cx, c.cz));
    this.dirty.delete(c);
    if (this.onUnload) this.onUnload(c);
  }

  // Ambil sampai 'max' chunk yang perlu di-mesh (anggaran per frame agar tidak patah-patah)
  takeDirty(max) {
    const out = [];
    for (const c of this.dirty) {
      this.dirty.delete(c);
      out.push(c);
      if (out.length >= max) break;
    }
    return out;
  }

  // Tinggi permukaan padat tertinggi di bawah titik (x, y, z); chunk belum ada = tahan di y
  groundAt(x, y, z) {
    const bx = Math.floor(x), bz = Math.floor(z);
    if (!this.has(bx >> 4, bz >> 4)) return y;
    for (let by = Math.min(Math.floor(y), this.height - 1); by >= 0; by--) {
      if (this.reg.at(this.getBlock(bx, by, bz)).solid) return by + 1;
    }
    return -Infinity;
  }

  update(dt, pos) {
    this.stream.update(this, pos[0], pos[2]);
    this.sched.update(this, dt);
  }

  // Muat semua chunk sekitar titik secara sinkron (awal permainan)
  preload(x, z) { this.stream.update(this, x, z, Infinity); }
}
