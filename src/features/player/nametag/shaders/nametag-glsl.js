// Billboard: pusat label dihitung di ruang kamera, sehingga selalu menghadap layar
export const NametagShaderSource = {
  vertex: `#version 300 es
    layout(location = 0) in vec2 a_corner; // -0.5..0.5
    uniform mat4 u_projection;
    uniform vec3 u_center;                 // pusat label (ruang kamera)
    uniform vec2 u_size;                   // lebar, tinggi (blok)
    out vec2 v_uv;

    void main() {
      v_uv = vec2(a_corner.x + 0.5, 0.5 - a_corner.y);
      gl_Position = u_projection * vec4(u_center + vec3(a_corner * u_size, 0.0), 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec2 v_uv;
    uniform sampler2D u_texture;
    out vec4 fragColor;

    void main() {
      fragColor = texture(u_texture, v_uv); // alpha sudah premultiplied
    }
  `
};
