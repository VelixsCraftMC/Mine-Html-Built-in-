// "collision": false -> bisa ditembus. Tanpa komponen ini = padat (true).
export const Collision = {
  id: "collision",
  apply(def, v) {
    if (typeof v !== "boolean") throw new Error("harus true/false");
    def.solid = v;
  }
};
