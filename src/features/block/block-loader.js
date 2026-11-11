import { Json } from "../../core/json.js";
import { BlockRegistry } from "./block-registry.js";
import { BlockDef } from "./block-def.js";
import { Components } from "./components/index.js";

// Membangun blok dari JSON: { "identifier": "ns:nama", "components": { ... } }
export class BlockLoader {
  // Daftar berkas dibaca dari assets/block/index.json (dibuat otomatis: node tools/index.mjs)
  static async loadAll(registry, ctx) {
    const index = await Json.get("assets/block/index.json", { blocks: [] });
    const files = Array.isArray(index.blocks) ? index.blocks : [];
    const jsons = await Promise.all(files.map(f => Json.get("assets/block/" + f)));
    for (const json of jsons) if (json) await this.register(registry, ctx, json, "minecraft");
  }

  // ns = namespace pemilik (mod memakai id-nya); komponen memakai ns untuk menyelesaikan path/id
  static async register(registry, ctx, json, ns) {
    const id = BlockRegistry.normalizeId(json && json.identifier, ns);
    if (!id || id.split(":")[0] !== ns) { console.warn(`[Block] identifier tidak valid untuk "${ns}":`, json && json.identifier); return false; }
    const def = await Components.applyAll(BlockDef.create(id), json.components, { ...ctx, ns });
    return registry.add(BlockDef.finish(def));
  }
}
