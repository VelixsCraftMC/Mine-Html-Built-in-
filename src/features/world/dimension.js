const NS_ID = /^[a-z0-9_]+:[a-z0-9_]+$/;
const num = (v, def, min, max) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def);

// Berkas dimension/*.json -> pengaturan dunia yang sudah bersih (nilai tidak valid = bawaan)
export class Dimension {
  static parse(json) {
    const d = json && json.dimension || {};
    const gen = d.generator && typeof d.generator === "object" ? d.generator : {};
    const spawn = d.spawn || {};
    return {
      id: NS_ID.test(d.identifier) ? d.identifier : "minecraft:overworld",
      biome: NS_ID.test(d.biome) ? d.biome : "minecraft:plains",
      height: Math.floor(num(d.height, 64, 8, 256)),
      renderDistance: Math.floor(num(d.render_distance, 4, 2, 12)),
      spawn: { x: num(spawn.x, 8.5, -3e7, 3e7), z: num(spawn.z, 8.5, -3e7, 3e7) },
      generator: { ...gen, type: typeof gen.type === "string" ? gen.type : "flat" }
    };
  }
}
