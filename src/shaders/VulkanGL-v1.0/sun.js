// Billboard di langit: hanya rotasi kamera yang dipakai (translasi dibuang), jadi matahari
// selalu berada "di tak hingga" dan tidak ikut bergeser saat pemain berjalan.
export const SunShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec2 a_corner; // -1..1 (FullscreenQuad)
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform vec3 u_center; // arah * jarak
    uniform vec3 u_right;  // sumbu kanan * setengah lebar
    uniform vec3 u_up;     // sumbu atas * setengah tinggi
    out vec2 v_uv;

    void main() {
      v_uv = vec2(a_corner.x, -a_corner.y) * 0.5 + 0.5;
      vec3 world = u_center + u_right * a_corner.x + u_up * a_corner.y;
      gl_Position = u_projection * vec4(mat3(u_view) * world, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec2 v_uv;
    uniform sampler2D u_texture;
    out vec4 fragColor;

    void main() {
      // Latar sun.png hitam: ditambahkan (additive), jadi hanya bagian terang yang terlihat
      fragColor = vec4(texture(u_texture, v_uv).rgb, 1.0);
    }
  `
};
