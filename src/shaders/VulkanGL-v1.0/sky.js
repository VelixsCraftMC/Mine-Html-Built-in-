export const SkyShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec2 a_position;
    uniform mat4 u_invViewProj;
    out vec3 v_rayDir;

    void main() {
      // Unproject layar NDC ke vektor arah pandangan 3D
      vec4 farPoint = u_invViewProj * vec4(a_position, 1.0, 1.0);
      v_rayDir = farPoint.xyz / farPoint.w;
      gl_Position = vec4(a_position, 1.0, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec3 v_rayDir;
    out vec4 fragColor;

    const vec3 c_horizon = vec3(0.753, 0.847, 1.0);
    const vec3 c_zenith  = vec3(0.290, 0.525, 0.910);
    const vec3 c_void    = vec3(0.100, 0.100, 0.120);

    void main() {
      vec3 dir = normalize(v_rayDir);
      float y = dir.y;
      vec3 skyColor;

      if (y >= 0.0) {
        float factor = pow(y, 0.65);
        skyColor = mix(c_horizon, c_zenith, factor);
      } else {
        float factor = pow(-y, 1.2);
        skyColor = mix(c_horizon, c_void, factor);
      }

      fragColor = vec4(skyColor, 1.0);
    }
  `
};