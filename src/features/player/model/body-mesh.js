export class BodyMesh {
  static build(geoJson) {
    const geo = geoJson["minecraft:geometry"][0];
    const tw = geo.description.texture_width || 64;
    const th = geo.description.texture_height || 64;
    const pos = [], uvs = [], norm = [];

    // Bangun semua bagian tubuh kecuali Kepala (Head)
    geo.bones.filter(b => b.name !== "Head").forEach(bone => {
      if (!bone.cubes) return;
      bone.cubes.forEach(c => {
        const inf = c.inflate || 0;
        const [x, y, z] = [(c.origin[0] - inf)*0.0625, (c.origin[1] - inf)*0.0625, (c.origin[2] - inf)*0.0625];
        const [w, h, d] = [(c.size[0] + inf*2)*0.0625, (c.size[1] + inf*2)*0.0625, (c.size[2] + inf*2)*0.0625];
        const [u, v] = c.uv;
        const [bw, bh, bd] = c.size;

        const faces = [
          { n: [0, 1, 0], v: [x,y+h,z, x+w,y+h,z, x+w,y+h,z+d, x,y+h,z+d], uv: [u+bd, v, bw, bd] },
          { n: [0,-1, 0], v: [x,y,z+d, x+w,y,z+d, x+w,y,z, x,y,z], uv: [u+bd+bw, v, bw, bd] },
          { n: [0, 0,-1], v: [x+w,y,z, x,y,z, x,y+h,z, x+w,y+h,z], uv: [u+bd, v+bd, bw, bh] },
          { n: [0, 0, 1], v: [x,y,z+d, x+w,y,z+d, x+w,y+h,z+d, x,y+h,z+d], uv: [u+bd+bw+bd, v+bd, bw, bh] },
          { n: [-1, 0, 0], v: [x,y,z, x,y,z+d, x,y+h,z+d, x,y+h,z], uv: [u, v+bd, bd, bh] },
          { n: [ 1, 0, 0], v: [x+w,y,z+d, x+w,y,z, x+w,y+h,z, x+w,y+h,z+d], uv: [u+bd+bw, v+bd, bd, bh] }
        ];

        faces.forEach(f => {
          const [u0, v0, uw, vh] = [f.uv[0]/tw, f.uv[1]/th, f.uv[2]/tw, f.uv[3]/th];
          const quadUvs = [[u0, v0+vh], [u0+uw, v0+vh], [u0+uw, v0], [u0, v0]];
          [0, 1, 2, 0, 2, 3].forEach(idx => {
            pos.push(f.v[idx*3], f.v[idx*3+1], f.v[idx*3+2]);
            norm.push(...f.n);
            uvs.push(quadUvs[idx][0], quadUvs[idx][1]);
          });
        });
      });
    });

    return { positions: new Float32Array(pos), uvs: new Float32Array(uvs), normals: new Float32Array(norm) };
  }
}