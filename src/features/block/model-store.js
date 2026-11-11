import { Json } from "../../core/json.js";
import { Paths } from "./paths.js";
import { FULL_MODEL } from "./block-def.js";

export const DIRS = ["up", "down", "north", "south", "east", "west"];
const MAX_CUBES = 64;
const clamp01 = v => Math.min(1, Math.max(0, v));
const num3 = a => Array.isArray(a) && a.length === 3 && a.every(Number.isFinite);

// uv Bedrock per sisi {uv:[u,v], uv_size:[w,h]} (piksel 16x16) -> pecahan [u0,v0,u1,v1]
function parseUv(face) {
  if (!face || !Array.isArray(face.uv) || !Array.isArray(face.uv_size)) return null;
  const [u, v] = face.uv, [w, h] = face.uv_size;
  return [u / 16, v / 16, (u + w) / 16, (v + h) / 16];
}

// Geometri blok format Bedrock (origin x/z -8..8, y 0..16) -> kubus dalam satuan blok 0..1
export function parseGeometry(json) {
  const geo = json && json["minecraft:geometry"] && json["minecraft:geometry"][0];
  if (!geo || !Array.isArray(geo.bones)) throw new Error("geometri tidak valid");
  const cubes = [];
  for (const bone of geo.bones) {
    for (const c of bone.cubes || []) {
      if (!num3(c.origin) || !num3(c.size) || cubes.length >= MAX_CUBES) continue;
      const min = [c.origin[0] / 16 + 0.5, c.origin[1] / 16, c.origin[2] / 16 + 0.5].map(clamp01);
      const max = [min[0] + c.size[0] / 16, min[1] + c.size[1] / 16, min[2] + c.size[2] / 16].map(clamp01);
      const uv = c.uv && typeof c.uv === "object" && !Array.isArray(c.uv)
        ? Object.fromEntries(DIRS.map(d => [d, parseUv(c.uv[d])])) : null;
      cubes.push({ min, max, uv });
    }
  }
  if (!cubes.length) throw new Error("geometri tanpa kubus");
  const f = cubes.length === 1 && cubes[0].min.every(v => v === 0) && cubes[0].max.every(v => v === 1);
  return { full: f, cubes };
}

// Satu berkas geometri dibaca sekali lalu dipakai bersama semua blok (cache per path).
export class ModelStore {
  constructor() { this.cache = new Map(); }

  async get(ref, ns) {
    if (typeof ref !== "string") throw new Error("nama geometri harus string");
    if (Paths.split(ref, ns).join(":") === "minecraft:full_block") return FULL_MODEL;
    const path = Paths.model(ref, ns);
    if (!path) throw new Error("nama geometri tidak valid: " + ref);
    if (!this.cache.has(path)) this.cache.set(path, Json.get(path).then(parseGeometry));
    return this.cache.get(path);
  }
}
