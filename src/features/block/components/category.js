// "category": "nature" -> kelompok di menu kreatif
export const Category = {
  id: "category",
  apply(def, v) {
    if (typeof v !== "string" || !/^[a-z_]{1,24}$/.test(v)) throw new Error("kategori a-z/_ maksimal 24 huruf");
    def.category = v;
  }
};
