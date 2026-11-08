import { BoxBuilder } from "./box-builder.js";

const ZERO = [0, 0, 0];

// Mesh dari satu/beberapa bone Bedrock. relativeToPivot=true membuat koordinat
// relatif pivot bone (untuk bagian yang berputar: kepala, lengan).
export class BoneMesh {
  static build(geoJson, boneNames, relativeToPivot) {
    const geo = geoJson["minecraft:geometry"][0];
    const tw = geo.description.texture_width || 64;
    const th = geo.description.texture_height || 64;
    const out = BoxBuilder.create();
    let count = 0;

    geo.bones
      .filter(b => boneNames.includes(b.name) && b.cubes)
      .forEach(b => {
        const pivot = relativeToPivot && b.pivot ? b.pivot : ZERO;
        b.cubes.forEach(c => {
          BoxBuilder.addBedrockCube(out, c, pivot, tw, th);
          count++;
        });
      });
    return count ? BoxBuilder.finish(out) : null;
  }
}
