export class HeadMesh {
  static build(geoJson) {
    const geo = geoJson["minecraft:geometry"][0];
    const tw = geo.description.texture_width || 64;
    const th = geo.description.texture_height || 64;
    const bone = geo.bones.find(b => b.name === "Head");
    if (!bone || !bone.cubes) return null;

    const pos = [], uvs = [], norm = [];
    bone.cubes.forEach(c => {
      const inf = c.inflate || 0;
      // Koordinat relatif terhadap pivot leher (Y = 1.5m / 24 Bedrock unit)
      const x0 = (c.origin[0] - inf) * 0.0625, x1 = (c.origin[0] + c.size[0] + inf) * 0.0625;
      const y0 = (c.origin[1] - 24.0 - inf) * 0.0625, y1 = (c.origin[1] - 24.0 + c.size[1] + inf) * 0.0625;
      const z0 = (c.origin[2] - inf) * 0.0625, z1 = (c.origin[2] + c.size[2] + inf) * 0.0625;

      const [u, v] = c.uv;
      const [w, h, d] = c.size;

      const faces = [
        { n: [0, 1, 0], v: [x0,y1,z0, x1,y1,z0, x1,y1,z1, x0,y1,z1], uv: [u+d, v, w, d] },
        { n: [0,-1, 0], v: [x0,y0,z1, x1,y0,z1, x1,y0,z0, x0,y0,z0], uv: [u+d+w, v, w, d] },
        { n: [0, 0,-1], v: [x1,y0,z0, x0,y0,z0, x0,y1,z0, x1,y1,z0], uv: [u+d, v+d, w, h] },
        { n: [0, 0, 1], v: [x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1], uv: [u+d+w+d, v+d, w, h] },
        { n: [-1, 0, 0], v: [x0,y0,z0, x0,y0,z1, x0,y1,z1, x0,y1,z0], uv: [u, v+d, d, h] },
        { n: [ 1, 0, 0], v: [x1,y0,z1, x1,y0,z0, x1,y1,z0, x1,y1,z1], uv: [u+d+w, v+d, d, h] }
      ];

      faces.forEach(f => {
        const [u0, v0, uw, vh] = [f.uv[0]/tw, f.uv[1]/th, f.uv[2]/tw, f.uv[3]/th];
        const quadUvs = [[u0, v0+vh], [u0+uw, v0+vh], [u0+uw, v0], [u0, v0]];
        [0, 1, 2, 0, 2, 3].forEach(i => {
          pos.push(f.v[i*3], f.v[i*3+1], f.v[i*3+2]);
          norm.push(...f.n);
          uvs.push(quadUvs[i][0], quadUvs[i][1]);
        });
      });
    });

    return { positions: new Float32Array(pos), uvs: new Float32Array(uvs), normals: new Float32Array(norm) };
  }
}