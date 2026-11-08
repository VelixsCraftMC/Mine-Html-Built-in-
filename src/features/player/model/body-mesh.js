import { BoxBuilder } from "./box-builder.js";

export class BodyMesh {
  static build(geoJson) {
    const geo = geoJson["minecraft:geometry"][0];
    const tw = geo.description.texture_width || 64;
    const th = geo.description.texture_height || 64;

    // Semua bagian tubuh kecuali Kepala (kepala punya pivot & rotasi sendiri)
    const out = BoxBuilder.create();
    geo.bones
      .filter(b => b.name !== "Head" && b.cubes)
      .forEach(b => b.cubes.forEach(c => BoxBuilder.addBedrockCube(out, c, 0, tw, th)));
    return BoxBuilder.finish(out);
  }
}
