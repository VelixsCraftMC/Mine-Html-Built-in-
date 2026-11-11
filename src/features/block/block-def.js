import { AIR } from "./block-registry.js";

export const FULL_MODEL = Object.freeze({
  full: true,
  cubes: [{ min: [0, 0, 0], max: [1, 1, 1], uv: null }]
});

const title = s => s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Nilai bawaan sebuah blok. Komponen hanya menimpa yang mereka kelola.
// Tanpa komponen collision/selection = padat dan bisa dipilih; tanpa geometry = blok penuh.
export class BlockDef {
  static create(id) {
    const [ns, name] = id.split(":");
    return {
      ...AIR, id, ns, name, numId: -1, displayName: title(name), category: "misc",
      solid: true, selectable: true, visible: true, full: true, opaque: true,
      model: FULL_MODEL, faces: null, loot: [], lightDampening: 15
    };
  }

  // Dipanggil sekali setelah semua komponen diterapkan: isi yang kosong, hitung turunan.
  static finish(def) {
    if (!def.faces) { // tanpa tekstur valid -> tekstur "hilang" (slot 0) agar kesalahan terlihat
      const miss = { tex: 0, ov: -1, tintBase: false, tintOv: false };
      def.faces = [miss, miss, miss, miss, miss, miss];
    }
    def.full = def.model.full;
    def.opaque = def.full && def.renderMethod === "opaque";
    return def;
  }
}
