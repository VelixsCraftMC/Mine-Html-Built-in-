// "displayname": "Grass Block" -> nama yang tampil di UI/inventori
export const DisplayName = {
  id: "displayname",
  apply(def, v) {
    const t = typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, "").trim() : "";
    if (!t) throw new Error("harus teks tidak kosong");
    def.displayName = t.slice(0, 48);
  }
};
