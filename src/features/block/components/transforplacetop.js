import { BlockRegistry } from "../block-registry.js";

// "transforplacetop": { "to": "minecraft:dirt", "tick": 10 }
// Ada blok diletakkan di atasnya -> setelah <tick> detik berubah menjadi <to>. Dibatalkan bila penutup dibuang.
export const TransforPlaceTop = {
  id: "transforplacetop",
  apply(def, v, ctx) {
    const to = v && BlockRegistry.normalizeId(v.to, ctx.ns);
    const sec = v && v.tick;
    if (!to) throw new Error('"to" tidak valid');
    if (typeof sec !== "number" || !(sec >= 0.05 && sec <= 3600)) throw new Error('"tick" (detik) harus 0.05..3600');
    def.transform = { to, seconds: sec };
  }
};
