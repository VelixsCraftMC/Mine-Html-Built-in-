export const PlayerShaderSource = {
  vertex: `#version 300 es
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec3 a_normal;

    uniform mat4 u_projection;
    uniform mat4 u_modelView;
    uniform mat4 u_normalMatrix;

    out vec2 v_uv;
    out float v_light;

    void main() {
      v_uv = a_uv;
      // Cahaya entitas Minecraft: dua arah dari atas + ambient 0.4.
      // Normal diputar oleh matriks model (dunia), bukan kamera,
      // jadi pencahayaan tidak ikut berubah saat kamera berputar.
      vec3 n = normalize(mat3(u_normalMatrix) * a_normal);
      vec3 l0 = normalize(vec3(0.2, 1.0, -0.7));
      vec3 l1 = normalize(vec3(-0.2, 1.0, 0.7));
      float diff = max(dot(n, l0), 0.0) + max(dot(n, l1), 0.0);
      v_light = min(1.0, 0.4 + 0.6 * diff);

      gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec2 v_uv;
    in float v_light;
    uniform sampler2D u_texture;
    out vec4 fragColor;

    void main() {
      vec4 texColor = texture(u_texture, v_uv);
      if (texColor.a < 0.1) discard;
      fragColor = vec4(texColor.rgb * v_light, texColor.a);
    }
  `
};
