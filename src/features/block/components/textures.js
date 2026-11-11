import { Paths } from "../paths.js";
import { Color } from "../../../core/color.js";

const RESERVED = new Set(["render_method", "carried"]);
const METHODS = ["opaque", "alpha_test"];
// urutan sisi = DIRS di model-store: up, down, north, south, east, west
const GROUP = [["up", "top"], ["down", "bottom"], ["north", "side"], ["south", "side"], ["east", "side"], ["west", "side"]];

// Satu entri sisi: "block/x" atau { texture, overlay?, tint? }. Path yang sama = satu slot atlas (tanpa duplikat).
function face(raw, ctx) {
  const o = typeof raw === "string" ? { texture: raw } : raw;
  const path = o && Paths.texture(o.texture, ctx.ns);
  if (!path) throw new Error("texture tidak valid: " + (o && o.texture));
  const ovPath = o.overlay ? Paths.texture(o.overlay, ctx.ns) : null;
  if (o.overlay && !ovPath) throw new Error("overlay tidak valid: " + o.overlay);
  const tinted = o.tint === "biome"; // dengan overlay, hanya overlay yang diwarnai (gaya rumput Bedrock)
  return {
    tex: ctx.atlas.require(path), ov: ovPath ? ctx.atlas.require(ovPath) : -1,
    tintBase: tinted && !ovPath, tintOv: tinted && !!ovPath
  };
}

// "textures": { "render_method", "*"|"top"|"bottom"|"side"|"north".."west", "carried" }
// Prioritas sisi: arah spesifik > grup (top/bottom/side) > "*"
export const Textures = {
  id: "textures",
  apply(def, v, ctx) {
    if (!v || typeof v !== "object") throw new Error("harus objek");
    if (v.render_method !== undefined) {
      if (!METHODS.includes(v.render_method)) throw new Error("render_method: " + METHODS.join(" | "));
      def.renderMethod = v.render_method;
    }
    const keys = Object.keys(v).filter(k => !RESERVED.has(k));
    if (!keys.length) throw new Error("tidak ada sisi bertekstur");
    const cache = new Map();
    const get = k => { if (!cache.has(k)) cache.set(k, face(v[k], ctx)); return cache.get(k); };
    const pick = (dir, grp) => {
      const k = [dir, grp, "*"].find(key => v[key] !== undefined);
      if (!k) throw new Error(`sisi ${dir} tanpa tekstur`);
      return get(k);
    };
    def.faces = GROUP.map(([dir, grp]) => pick(dir, grp));
    const c = v.carried; // tekstur versi dipegang/inventori (belum digambar; disimpan sebagai data)
    if (c && Paths.texture(c.texture, ctx.ns)) {
      def.carried = { path: Paths.texture(c.texture, ctx.ns), color: Color.hex(c.overlay_color) };
    }
  }
};
