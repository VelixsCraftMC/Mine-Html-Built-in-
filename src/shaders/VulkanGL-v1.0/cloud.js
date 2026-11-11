import { SkyShader } from "./sky.js";

// Awan 3D ala Minecraft Java (Fancy): sel 12x12 blok, tebal 4 blok, tanpa geometri.
// Tiap piksel menembakkan sinar ke lempeng awan [base, top], lalu menelusuri grid sel (DDA)
// sampai kena sel berisi di clouds.png. Hanya muka terdepan yang digambar (setara depth pre-pass MC),
// jadi tidak ada penumpukan alpha. Shade muka = Minecraft: atas 1.0, timur/barat 0.9, utara/selatan 0.8, bawah 0.7.
export const CloudShader = {
  vertex: SkyShader.vertex,
  fragment: `#version 300 es
      precision highp float;
      precision highp int;
      in vec3 v_rayDir;
      uniform sampler2D u_texture;
      uniform vec3 u_camPos;
      uniform vec4 u_cloud;  // x = y dasar, y = y atas, z = geseran angin (blok), w = ukuran sel (blok)
      uniform vec3 u_fade;   // x = mulai pudar, y = hilang total (blok mendatar), z = alpha awan
      out vec4 fragColor;

      const int MAX_STEPS = 96; // cukup untuk jarak pudar 650 blok / sel 12

      void main() {
        vec3 o = u_camPos;
        vec3 d = normalize(v_rayDir - o);
        float cell = u_cloud.w;
        float lenXZ = length(d.xz);
        float tEnd = u_fade.y / max(lenXZ, 1e-4);   // batas jarak sinar (sesuai batas pudar)
        float tIn = 0.0;
        int face = -1;                               // 0 atas, 1 bawah, 2 sisi X, 3 sisi Z, -1 kamera di dalam awan

        if (abs(d.y) < 1e-5) {
          if (o.y < u_cloud.x || o.y > u_cloud.y) discard;
        } else {
          float ta = (u_cloud.x - o.y) / d.y;
          float tb = (u_cloud.y - o.y) / d.y;
          float tf = max(ta, tb);
          if (tf <= 0.0) discard;
          float tn = min(ta, tb);
          if (tn > 0.0) { tIn = tn; face = d.y < 0.0 ? 0 : 1; }
          tEnd = min(tf, tEnd);
        }
        if (tIn >= tEnd) discard;

        vec2 p = o.xz + d.xz * tIn + vec2(u_cloud.z, 0.0);
        vec2 stp = vec2(d.x >= 0.0 ? 1.0 : -1.0, d.z >= 0.0 ? 1.0 : -1.0);
        vec2 inv = 1.0 / max(abs(d.xz), vec2(1e-6));
        vec2 c = floor(p / cell);
        vec2 tNext = tIn + ((c + step(0.0, stp)) * cell - p) * stp * inv;
        float t = tIn;
        int hit = -2;

        for (int i = 0; i < MAX_STEPS; i++) {
          if (texelFetch(u_texture, ivec2(c) & 255, 0).a >= 0.5) {
            hit = face;
            if (face < 0) {                          // di dalam sel: tampilkan dinding dalam
              float te = min(tNext.x, tNext.y);
              if (te >= tEnd) { hit = d.y > 0.0 ? 0 : 1; t = tEnd; }
              else { hit = tNext.x < tNext.y ? 2 : 3; t = te; }
            }
            break;
          }
          if (tNext.x < tNext.y) {
            t = tNext.x; if (t >= tEnd) break;
            c.x += stp.x; tNext.x += cell * inv.x; face = 2;
          } else {
            t = tNext.y; if (t >= tEnd) break;
            c.y += stp.y; tNext.y += cell * inv.y; face = 3;
          }
        }
        if (hit == -2) discard;

        float fade = 1.0 - smoothstep(u_fade.x, u_fade.y, t * lenXZ);
        if (fade <= 0.0) discard;
        float shade = hit == 0 ? 1.0 : (hit == 1 ? 0.7 : (hit == 2 ? 0.9 : 0.8));
        fragColor = vec4(vec3(shade), u_fade.z * fade);
      }
  `
};
