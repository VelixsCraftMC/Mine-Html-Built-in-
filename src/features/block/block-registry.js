const ID = /^[a-z0-9_]+:[a-z0-9_]+$/;

// Blok udara: id numerik 0, tidak digambar, tidak padat.
export const AIR = Object.freeze({
  id: "minecraft:air", ns: "minecraft", name: "air", numId: 0, displayName: "Air", category: "none",
  solid: false, selectable: false, opaque: false, full: false, visible: false,
  model: null, faces: null, carried: null, loot: [], transform: null, lightDampening: 0, renderMethod: "opaque"
});

// Daftar blok: id teks ("minecraft:dirt") <-> id numerik (Uint16 di chunk).
export class BlockRegistry {
  constructor() {
    this.list = [AIR];
    this.byName = new Map([[AIR.id, AIR]]);
  }

  // "dirt" + ns -> "ns:dirt"; tidak valid -> null
  static normalizeId(id, ns = "minecraft") {
    if (typeof id !== "string") return null;
    const full = id.includes(":") ? id : `${ns}:${id}`;
    return ID.test(full) ? full : null;
  }

  add(def) {
    if (this.byName.has(def.id)) { console.warn("[Block] id ganda, dilewati:", def.id); return false; }
    if (this.list.length >= 65535) { console.warn("[Block] batas 65535 blok tercapai"); return false; }
    def.numId = this.list.length;
    this.list.push(def);
    this.byName.set(def.id, def);
    return true;
  }

  get(id) { return this.byName.get(id) || null; }
  at(numId) { return this.list[numId] || AIR; }
  idOf(id) { const d = this.byName.get(id); return d ? d.numId : -1; }
  get size() { return this.list.length; }
}
