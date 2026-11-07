export class GeoParser {
  static extractBoneCubes(geoJson, boneName) {
    const geometry = geoJson["minecraft:geometry"][0];
    const texW = geometry.description.texture_width || 64;
    const texH = geometry.description.texture_height || 64;
    const bone = geometry.bones.find(b => b.name === boneName);
    if (!bone || !bone.cubes) return null;

    const pos = [], uvs = [], norm = [];
    bone.cubes.forEach(cube => {
      const inf = cube.inflate || 0.0;
      this.buildArmCube(cube.uv, texW, texH, inf, pos, uvs, norm);
    });

    return {
      positions: new Float32Array(pos),
      uvs: new Float32Array(uvs),
      normals: new Float32Array(norm)
    };
  }

  static buildArmCube(uv, tw, th, inf, pos, uvs, norm) {
    // Koordinat relatif bahu: X[-3, 1], Y[-2, 10] (ke bawah), Z[-2, 2]
    const x0 = (-3.0 - inf) * 0.0625, x1 = (1.0 + inf) * 0.0625;
    const y0 = (-2.0 - inf) * 0.0625, y1 = (10.0 + inf) * 0.0625;
    const z0 = (-2.0 - inf) * 0.0625, z1 = (2.0 + inf) * 0.0625;
    const [u, v] = uv;
    const [w, h, d] = [4, 12, 4];

    const faces = [
      // Top / Bahu (-Y)
      { n: [0, -1, 0], v: [x0,y0,z0, x1,y0,z0, x1,y0,z1, x0,y0,z1], uv: [u+d, v, w, d] },
      // Bottom / Telapak (+Y)
      { n: [0,  1, 0], v: [x0,y1,z1, x1,y1,z1, x1,y1,z0, x0,y1,z0], uv: [u+d+w, v, w, d] },
      // Front / Depan (-Z)
      { n: [0, 0, -1], v: [x1,y0,z0, x0,y0,z0, x0,y1,z0, x1,y1,z0], uv: [u+d, v+d, w, h] },
      // Back / Belakang (+Z)
      { n: [0, 0,  1], v: [x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1], uv: [u+d+w+d, v+d, w, h] },
      // West / Luar (-X)
      { n: [-1, 0, 0], v: [x0,y0,z0, x0,y0,z1, x0,y1,z1, x0,y1,z0], uv: [u, v+d, d, h] },
      // East / Dalam (+X)
      { n: [ 1, 0, 0], v: [x1,y0,z1, x1,y0,z0, x1,y1,z0, x1,y1,z1], uv: [u+d+w, v+d, d, h] }
    ];

    faces.forEach(f => {
      const [u0, v0, uw, vh] = [f.uv[0]/tw, f.uv[1]/th, f.uv[2]/tw, f.uv[3]/th];
      const indices = [0, 1, 2, 0, 2, 3];
      const quadUvs = [[u0, v0], [u0+uw, v0], [u0+uw, v0+vh], [u0, v0+vh]];

      indices.forEach(idx => {
        pos.push(f.v[idx*3], f.v[idx*3+1], f.v[idx*3+2]);
        norm.push(...f.n);
        uvs.push(quadUvs[idx][0], quadUvs[idx][1]);
      });
    });
  }
}