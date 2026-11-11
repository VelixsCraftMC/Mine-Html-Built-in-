// "geometry": "full_block" | nama berkas models/block/<nama>.geo.json (boleh "mod:nama")
export const Geometry = {
  id: "geometry",
  async apply(def, v, ctx) {
    def.model = await ctx.models.get(v, ctx.ns);
  }
};
