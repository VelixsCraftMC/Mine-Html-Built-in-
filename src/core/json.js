import { Assets } from "./assets.js";

// Pintu tunggal baca JSON. Tidak pernah melempar: gagal/berkas rusak = peringatan + nilai cadangan.
export class Json {
  static async get(path, fallback = null) {
    try {
      const res = await Assets.fetch(path);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.warn(`[Json] ${path} tidak bisa dibaca:`, err.message);
      return fallback;
    }
  }
}
