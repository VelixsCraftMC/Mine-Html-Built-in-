import { CHUNK } from "./chunk.js";

// Memuat chunk di sekitar pemain (terdekat dulu, ada anggaran per panggilan) dan membuang yang jauh.
// Chunk yang pernah diubah tidak dibuang (belum ada penyimpanan dunia).
export class ChunkStream {
  constructor(radius) {
    this.r = radius;
    this.cx = NaN;
    this.cz = NaN;
    this.queue = [];
  }

  update(world, px, pz, budget = 2) {
    const cx = Math.floor(px / CHUNK), cz = Math.floor(pz / CHUNK);
    if (cx !== this.cx || cz !== this.cz) { this.cx = cx; this.cz = cz; this.plan(world); }
    for (let i = 0; i < budget && this.queue.length; i++) {
      const c = this.queue.pop(); // terdekat ada di akhir
      world.load(c[0], c[1]);
    }
  }

  plan(world) {
    const r = this.r, q = [];
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        const d = dx * dx + dz * dz;
        if (d <= r * r && !world.has(this.cx + dx, this.cz + dz)) q.push([this.cx + dx, this.cz + dz, d]);
      }
    }
    this.queue = q.sort((a, b) => b[2] - a[2]);
    for (const c of [...world.chunks.values()]) {
      const far = Math.abs(c.cx - this.cx) > r + 1 || Math.abs(c.cz - this.cz) > r + 1;
      if (far && !c.modified) world.unload(c);
    }
  }
}
