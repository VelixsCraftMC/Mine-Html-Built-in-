import { Json } from "../../core/json.js";
import { Color } from "../../core/color.js";
import { ColorMap } from "./colormap.js";

const NAME = /^[a-z0-9_]+$/;
const FALLBACK_GRASS = [0.57, 0.74, 0.35];
const clamp = (v, d) => (Number.isFinite(v) ? Math.min(2, Math.max(-1, v)) : d);

// Biome klien: assets/biome/<nama>.client_biome.json (+ biomes_client.json sebagai cadangan),
// kabut dari assets/fog/<fog>.json, warna rumput dari assets/textures/colormap/grass.png
export class BiomeLoader {
  static async load(id) {
    const name = String(id).split(":").pop();
    if (!NAME.test(name)) throw new Error("id biome tidak valid: " + id);
    const client = await Json.get(`assets/biome/${name}.client_biome.json`, null);
    const table = await Json.get("assets/biome/biomes_client.json", { biomes: {} });
    const entry = (table.biomes && (table.biomes[id] || table.biomes.default)) || {};
    const comp = client && client.client_biome && client.client_biome.components || {};
    const fogName = String(comp.fog || entry.fog_identifier || "").split(":").pop();
    const fog = NAME.test(fogName) ? await Json.get(`assets/fog/${fogName}.json`, null) : null;
    const climate = comp.climate || {};
    const temp = clamp(climate.temperature, 0.8), rain = clamp(climate.downfall, 0.4);
    const map = await ColorMap.load("assets/textures/colormap/grass.png");
    return {
      id,
      water: Color.hex(comp.water || entry.water_surface_color) || Color.hex("#44AFF5"),
      fog: fog && fog.fog_settings || null,
      grass: map ? ColorMap.sample(map, temp, rain) : FALLBACK_GRASS
    };
  }
}
