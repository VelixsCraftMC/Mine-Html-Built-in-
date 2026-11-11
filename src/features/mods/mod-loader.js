import { Json } from "../../core/json.js";
import { BlockLoader } from "../block/block-loader.js";

const SAFE_ID = /^[a-z0-9_]{1,32}$/;
const SAFE_FILE = /^(?!.*\.\.)[\w\-./]+\.json$/;
const MAX_MODS = 32;

// Mod native: mods/<id>/manifest.json. Tiap mod diisolasi: rusak = dilewati, game tetap jalan.
export class ModLoader {
  static async loadAll(registry, ctx) {
    const cfg = await Json.get("mods/mods.json", { enabled: [] });
    const ids = Array.isArray(cfg.enabled) ? cfg.enabled.filter(i => SAFE_ID.test(i)).slice(0, MAX_MODS) : [];
    const loaded = [];
    for (const id of ids) {
      try { loaded.push(await this.loadOne(registry, ctx, id)); }
      catch (err) { console.warn(`[Mod] "${id}" dilewati:`, err.message); }
    }
    return loaded;
  }

  static async loadOne(registry, ctx, id) {
    const man = await Json.get(`mods/${id}/manifest.json`);
    if (!man || man.id !== id) throw new Error("manifest hilang atau id tidak cocok");
    const files = (Array.isArray(man.blocks) ? man.blocks : []).filter(f => SAFE_FILE.test(f));
    const jsons = await Promise.all(files.map(f => Json.get(`mods/${id}/${f}`)));
    let count = 0;
    for (const json of jsons) if (json && await BlockLoader.register(registry, ctx, json, id)) count++;
    return { id, name: man.name || id, version: man.version || "0", blocks: count };
  }
}
