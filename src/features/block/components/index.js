import { DisplayName } from "./displayname.js";
import { Category } from "./category.js";
import { Collision } from "./collision.js";
import { Selection } from "./selection.js";
import { LightDampening } from "./lightdampening.js";
import { Geometry } from "./geometry.js";
import { Textures } from "./textures.js";
import { Loot } from "./loot.js";
import { TransforPlaceTop } from "./transforplacetop.js";

const map = new Map();

// Komponen = { id, apply(def, nilai, ctx) } (boleh async). Satu berkas per komponen.
// Komponen baru: buat berkasnya, tambah satu import + satu entri di daftar bawah (atau Components.register dari mod).
export class Components {
  static register(c) {
    if (!c || typeof c.id !== "string" || typeof c.apply !== "function") throw new Error("Komponen block tidak valid");
    map.set(c.id, c);
  }

  static has(id) { return map.has(id); }

  // Komponen rusak/tidak dikenal dilewati (peringatan), blok tetap jadi dengan nilai bawaan.
  static async applyAll(def, components, ctx) {
    for (const [key, value] of Object.entries(components || {})) {
      const c = map.get(key);
      if (!c) { console.warn(`[Block] komponen tidak dikenal "${key}" di ${def.id}`); continue; }
      try { await c.apply(def, value, ctx); }
      catch (err) { console.warn(`[Block] komponen "${key}" di ${def.id} diabaikan: ${err.message}`); }
    }
    return def;
  }
}

[DisplayName, Category, Collision, Selection, LightDampening, Geometry, Textures, Loot, TransforPlaceTop]
  .forEach(c => Components.register(c));
