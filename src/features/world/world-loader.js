import { Json } from "../../core/json.js";
import { BlockRegistry } from "../block/block-registry.js";
import { BlockLoader } from "../block/block-loader.js";
import { ModelStore } from "../block/model-store.js";
import { TextureAtlas } from "../block/texture-atlas.js";
import { ModLoader } from "../mods/mod-loader.js";
import { BiomeLoader } from "../biome/biome-loader.js";
import { Fog } from "../biome/fog.js";
import { Dimension } from "./dimension.js";
import { World } from "./world.js";

export const DEFAULT_DIMENSION = "dimension/overworld.flat.json";

// Merakit semua data dunia (tanpa GL): blok bawaan + mod -> atlas -> biome -> dunia, lalu muat chunk awal.
export class WorldLoader {
  static async load(path = DEFAULT_DIMENSION) {
    const dim = Dimension.parse(await Json.get(path, {}));
    const registry = new BlockRegistry(), atlas = new TextureAtlas();
    const ctx = { registry, atlas, models: new ModelStore() };
    await BlockLoader.loadAll(registry, ctx);
    const mods = await ModLoader.loadAll(registry, ctx);
    atlas.freeze();
    const biome = await BiomeLoader.load(dim.biome);
    const world = new World(registry, dim);
    world.preload(dim.spawn.x, dim.spawn.z);
    const fog = Fog.resolve(biome.fog, dim.renderDistance * 16);
    return { dim, registry, atlas, biome, fog, mods, world, spawn: [dim.spawn.x, world.surface, dim.spawn.z] };
  }
}
