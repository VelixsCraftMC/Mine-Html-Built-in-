// Dua segitiga penutup layar (NDC -1..1, atribut 0 = vec2). Dipakai lapisan langit dan efek layar penuh.
const VERTICES = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

export class FullscreenQuad {
  static create(gl) {
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return { vao, vbo };
  }

  static draw(gl, quad) {
    gl.bindVertexArray(quad.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  static dispose(gl, quad) {
    if (!gl || !quad) return;
    gl.deleteBuffer(quad.vbo);
    gl.deleteVertexArray(quad.vao);
    quad.vbo = quad.vao = null;
  }
}
