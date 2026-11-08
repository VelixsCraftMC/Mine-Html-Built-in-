// Vertex memakai ulang vertex langit (unproject layar -> titik di bidang far, ruang dunia).
// Fragment: tiap piksel menembakkan sinar dari kamera ke bidang awan datar, lalu membaca clouds.png.
export const CloudShaderFragment = `#version 300 es
    precision highp float; // koordinat dunia besar: mediump terlalu kasar di Android
    in vec3 v_rayDir;
    uniform sampler2D u_texture;
    uniform vec3 u_camPos;   // posisi kamera (dunia)
    uniform vec2 u_cloud;    // x = tinggi awan relatif kamera (blok), y = geseran angin (blok)
    out vec4 fragColor;

    const float PERIOD = 3072.0;          // 256 sel x 12 blok
    const float FADE_START = 300.0;       // awan memudar di kejauhan (tanpa fog, tepi tidak keras)
    const float FADE_END = 650.0;

    void main() {
      vec3 dir = normalize(v_rayDir - u_camPos);
      if (dir.y < 0.02) discard;
      vec2 hor = dir.xz * (u_cloud.x / dir.y);
      float fade = 1.0 - smoothstep(FADE_START, FADE_END, length(hor));
      if (fade <= 0.0) discard;
      vec2 uv = fract((u_camPos.xz + hor + vec2(u_cloud.y, 0.0)) / PERIOD);
      if (texture(u_texture, uv).a < 0.5) discard;
      fragColor = vec4(vec3(0.96), 0.85 * fade);
    }
  `;
