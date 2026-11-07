export class CapeMesh {
  static build() {
    const tw = 64, th = 32;
    // Dimensi Jubah Minecraft: Lebar 10, Tinggi 16, Tebal 1 (skala meter)
    const x0 = -0.3125, x1 = 0.3125;
    const y0 = -1.0,    y1 = 0.0;
    const z0 = 0.0,     z1 = 0.0625;

    const faces = [
      // Sisi Belakang (Logo Mojang menghadap ke luar kamera belakang)
      { n: [0, 0, 1], v: [x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1], uv: [1, 1, 10, 16] },
      // Sisi Depan (Menghadap punggung baju Steve)
      { n: [0, 0,-1], v: [x1,y0,z0, x0,y0,z0, x0,y1,z0, x1,y1,z0], uv: [12, 1, 10, 16] },
      // Atas
      { n: [0, 1, 0], v: [x0,y1,z0, x1,y1,z0, x1,y1,z1, x0,y1,z1], uv: [1, 0, 10, 1] },
      // Bawah
      { n: [0,-1, 0], v: [x0,y0,z1, x1,y0,z1, x1,y0,z0, x0,y0,z0], uv: [11, 0, 10, 1] },
      // Kiri
      { n: [-1, 0, 0], v: [x0,y0,z0, x0,y0,z1, x0,y1,z1, x0,y1,z0], uv: [0, 1, 1, 16] },
      // Kanan
      { n: [ 1, 0, 0], v: [x1,y0,z1, x1,y0,z0, x1,y1,z0, x1,y1,z1], uv: [11, 1, 1, 16] }
    ];

    const pos = [], uvs = [], norm = [];
    faces.forEach(f => {
      const [u0, v0, uw, vh] = [f.uv[0]/tw, f.uv[1]/th, f.uv[2]/tw, f.uv[3]/th];
      const quadUvs = [[u0, v0+vh], [u0+uw, v0+vh], [u0+uw, v0], [u0, v0]];
      [0, 1, 2, 0, 2, 3].forEach(idx => {
        pos.push(f.v[idx*3], f.v[idx*3+1], f.v[idx*3+2]);
        norm.push(...f.n);
        uvs.push(quadUvs[idx][0], quadUvs[idx][1]);
      });
    });

    return { positions: new Float32Array(pos), uvs: new Float32Array(uvs), normals: new Float32Array(norm) };
  }
}