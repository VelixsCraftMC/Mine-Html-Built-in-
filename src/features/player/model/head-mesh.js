import { BoxBuilder } from "./box-builder.js";

export class HeadMesh {
  static build(geoJson) {
    const geo = geoJson["minecraft:geometry"][0];
    const tw = geo.description.texture_width || 64;
    const th = geo.description.texture_height || 64;
    const bone = geo.bones.find(b => b.name === "Head");
    if (!bone || !bone.cubes) return null;

    // Koordinat relatif pivot leher (24 unit Bedrock dari tanah)
    const out = BoxBuilder.create();
    bone.cubes.forEach(c => BoxBuilder.addBedrockCube(out, c, 24, tw, th));
    return BoxBuilder.finish(out);
  }
}
