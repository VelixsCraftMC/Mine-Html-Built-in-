import { BlockRegistry } from "../block-registry.js";

const MAX_ENTRIES = 16;

// "loot": ["minecraft:dirt", { "id": "minecraft:dirt", "count": 2 }] -> yang jatuh saat dihancurkan
export const Loot = {
  id: "loot",
  apply(def, v, ctx) {
    if (!Array.isArray(v)) throw new Error("harus daftar");
    def.loot = v.slice(0, MAX_ENTRIES).map(e => {
      const raw = typeof e === "string" ? e : e && e.id;
      const id = BlockRegistry.normalizeId(raw, ctx.ns);
      const count = typeof e === "object" && Number.isInteger(e.count) ? Math.min(64, Math.max(1, e.count)) : 1;
      if (!id) throw new Error("id loot tidak valid: " + raw);
      return { id, count };
    });
  }
};
