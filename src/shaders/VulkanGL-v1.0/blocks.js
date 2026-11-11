// Block: satu atlas; overlay (rumput samping) diwarnai terpisah; kabut linear sesuai biome.
export const BlocksShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec3 a_pos;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec2 a_ov;
    layout(location = 3) in vec3 a_col;
    layout(location = 4) in vec3 a_ovcol;
    uniform mat4 u_viewProj;
    uniform vec3 u_chunk;
    uniform vec3 u_cam;
    out vec2 v_uv;
    out vec2 v_ov;
    out vec3 v_col;
    out vec3 v_ovcol;
    out float v_dist;

    void main() {
      vec3 w = a_pos + u_chunk;
      v_uv = a_uv; v_ov = a_ov; v_col = a_col; v_ovcol = a_ovcol;
      v_dist = length(w - u_cam);
      gl_Position = u_viewProj * vec4(w, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision highp float;
    in vec2 v_uv;
    in vec2 v_ov;
    in vec3 v_col;
    in vec3 v_ovcol;
    in float v_dist;
    uniform sampler2D u_atlas;
    uniform vec3 u_fogColor;
    uniform vec2 u_fog;
    out vec4 fragColor;

    void main() {
      vec4 t = texture(u_atlas, v_uv);
      if (t.a < 0.5) discard;
      vec3 rgb = t.rgb * v_col;
      if (v_ov.x >= 0.0) {
        vec4 o = texture(u_atlas, v_ov);
        rgb = mix(rgb, o.rgb * v_ovcol, o.a);
      }
      float f = clamp((v_dist - u_fog.x) / (u_fog.y - u_fog.x), 0.0, 1.0);
      fragColor = vec4(mix(rgb, u_fogColor, f), 1.0);
    }
  `
};
