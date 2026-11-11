// "lightdampening": 0..15 -> seberapa banyak cahaya tertahan (15 = penuh). Data untuk sistem cahaya nanti.
export const LightDampening = {
  id: "lightdampening",
  apply(def, v) {
    if (!Number.isInteger(v) || v < 0 || v > 15) throw new Error("harus bilangan bulat 0..15");
    def.lightDampening = v;
  }
};
