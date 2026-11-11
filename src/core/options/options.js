import { Assets } from "../assets.js";
import { OptionSchema } from "./option-schema.js";

const isLeaf = node => typeof node.check === "function";

export class Options {
  // Skema + data mentah -> objek valid penuh (kolom asing diabaikan)
  static sanitize(raw, schema = OptionSchema, path = "") {
    const src = raw !== null && typeof raw === "object" ? raw : {};
    const out = {};
    for (const key of Object.keys(schema)) {
      const node = schema[key];
      if (!isLeaf(node)) {
        out[key] = this.sanitize(src[key], node, path + key + ".");
        continue;
      }
      const v = node.check(src[key]);
      if (v === undefined && src[key] !== undefined) {
        console.warn(`[Options] "${path}${key}" tidak valid, memakai default:`, node.def);
      }
      out[key] = v === undefined ? node.def : v;
    }
    return out;
  }

  static defaults() {
    return this.sanitize({});
  }

  // Tidak pernah melempar error: gagal fetch/parse = default
  static async load(url = "option.json") {
    try {
      const res = await Assets.fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return this.sanitize(await res.json());
    } catch (err) {
      console.warn("[Options] option.json gagal dimuat, memakai default:", err);
      return this.defaults();
    }
  }
}
