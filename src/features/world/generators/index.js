import { FlatGenerator } from "./flat.js";

const map = new Map();

// Generator = { id, create(config, registry, height) -> { fill(chunk), surface } }
// Generator baru: satu berkas + satu baris di bawah (atau Generators.register dari mod).
export class Generators {
  static register(g) {
    if (!g || typeof g.id !== "string" || typeof g.create !== "function") throw new Error("Generator tidak valid");
    map.set(g.id, g);
  }

  static get(type) {
    const g = map.get(type);
    if (!g) throw new Error(`Generator "${type}" tidak dikenal`);
    return g;
  }
}

[FlatGenerator].forEach(g => Generators.register(g));
