import { Assets } from "../../core/assets.js";

// Colormap Minecraft (256x256): x = (1 - suhu), y = (1 - suhu*curah_hujan) -> warna rumput/daun per biome
export class ColorMap {
  // Browser: baca piksel PNG sekali. Gagal -> null (pemanggil memakai warna cadangan)
  static load(path) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement("canvas");
        cv.width = img.width; cv.height = img.height;
        const g = cv.getContext("2d");
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, img.width, img.height);
        cv.width = cv.height = 0;
        resolve({ w: d.width, h: d.height, data: d.data });
      };
      img.onerror = () => { console.warn("[ColorMap] gagal memuat:", path); resolve(null); };
      img.src = Assets.url(path);
    });
  }

  // map: { w, h, data RGBA } -> [r, g, b] 0..1
  static sample(map, temperature, downfall) {
    const t = Math.min(1, Math.max(0, temperature));
    const r = Math.min(1, Math.max(0, downfall)) * t;
    const x = Math.round((1 - t) * (map.w - 1)), y = Math.round((1 - r) * (map.h - 1));
    const i = (y * map.w + x) * 4;
    return [map.data[i] / 255, map.data[i + 1] / 255, map.data[i + 2] / 255];
  }
}
