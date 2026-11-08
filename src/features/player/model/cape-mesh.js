import { BoxBuilder } from "./box-builder.js";
import { PX } from "./model-const.js";

export class CapeMesh {
  static build() {
    const out = BoxBuilder.create();
    // Kotak jubah Minecraft 10x16x1 piksel, tepi atas di y=0, tekstur 64x32
    BoxBuilder.addBox(out, -5 * PX, -16 * PX, -1 * PX, 5 * PX, 0, 0, 0, 0, 10, 16, 1, 64, 32);
    const mesh = BoxBuilder.finish(out);

    // Putar 180 derajat sumbu Y: sisi logo menghadap keluar dari punggung pemain
    for (const arr of [mesh.positions, mesh.normals]) {
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] = -arr[i];
        arr[i + 2] = -arr[i + 2];
      }
    }
    return mesh;
  }
}
