export const PlayerShaderSource = {
  vertex: `#version 300 es
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec3 a_normal;

    uniform mat4 u_projection;
    uniform mat4 u_modelView;

    out vec2 v_uv;
    out float v_light;

    void main() {
      v_uv = a_uv;
      // Transform normal model ke ruang pandang mata
      vec3 norm = normalize(mat3(u_modelView) * a_normal);
      vec3 lightDir = normalize(vec3(0.25, 0.85, 0.45));
      float diff = max(dot(norm, lightDir), 0.0);
      v_light = 0.60 + 0.40 * diff;

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