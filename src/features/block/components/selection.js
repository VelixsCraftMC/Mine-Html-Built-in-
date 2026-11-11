// "selection": false -> tidak bisa dibidik/dihancurkan. Tanpa komponen ini = true.
export const Selection = {
  id: "selection",
  apply(def, v) {
    if (typeof v !== "boolean") throw new Error("harus true/false");
    def.selectable = v;
  }
};
