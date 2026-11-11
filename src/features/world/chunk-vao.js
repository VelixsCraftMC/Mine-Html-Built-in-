const STRIDE = 13 * 4;

// VAO + VBO + IBO satu chunk. Buffer dipakai ulang saat mesh dibangun ulang; dispose melepas semuanya.
export class ChunkVao {
  static upload(gl, mesh, data) {
    const m = mesh || ChunkVao.create(gl);
    gl.bindVertexArray(m.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data.verts, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    m.count = data.idx.length;
    return m;
  }

  static create(gl) {
    const m = { vao: gl.createVertexArray(), vbo: gl.createBuffer(), ibo: gl.createBuffer(), count: 0 };
    gl.bindVertexArray(m.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
    [[0, 3, 0], [1, 2, 12], [2, 2, 20], [3, 3, 28], [4, 3, 40]].forEach(([loc, size, off]) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE, off);
    });
    gl.bindVertexArray(null);
    return m;
  }

  static draw(gl, m) {
    gl.bindVertexArray(m.vao);
    gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_INT, 0);
  }

  static dispose(gl, m) {
    if (!gl || !m) return;
    gl.deleteBuffer(m.vbo);
    gl.deleteBuffer(m.ibo);
    gl.deleteVertexArray(m.vao);
  }
}
