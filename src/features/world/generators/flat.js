import { CHUNK } from "../chunk.js";

// Dunia datar: layers dari bawah (y = 0) ke atas. Tinggi permukaan = jumlah semua 'count'.
export const FlatGenerator = {
  id: "flat",

  // Mengembalikan { fill(chunk), surface } — id blok diselesaikan sekali di sini, bukan per chunk
  create(config, registry, height) {
    const slabs = [];
    for (const l of Array.isArray(config.layers) ? config.layers : []) {
      const id = registry.idOf(l && l.block);
      const count = Number.isInteger(l && l.count) ? l.count : 0;
      if (id < 1 || count < 1) { console.warn("[Flat] layer dilewati:", l && l.block); continue; }
      for (let i = 0; i < count && slabs.length < height; i++) slabs.push(id);
    }
    const area = CHUNK * CHUNK;
    return {
      surface: slabs.length,
      fill(chunk) {
        slabs.forEach((id, y) => chunk.data.fill(id, y * area, (y + 1) * area));
        chunk.top = slabs.length;
      }
    };
  }
};
