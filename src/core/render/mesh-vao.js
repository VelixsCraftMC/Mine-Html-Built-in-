// Pemilik VAO + semua VBO-nya, sehingga dispose tidak menyisakan buffer GPU (leak).
export class MeshVao {
  static create(gl, mesh) {
    if (!mesh) return null;
    const vao = gl.createVertexArray();
    const buffers = [];
    gl.bindVertexArray(vao);
    [[0, 3, mesh.positions], [1, 2, mesh.uvs], [2, 3, mesh.normals]].forEach(([loc, size, data]) => {
      const vbo = gl.createBuffer();
      buffers.push(vbo);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    });
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return { vao, buffers, count: mesh.positions.length / 3 };
  }

  static draw(gl, mesh) {
    gl.bindVertexArray(mesh.vao);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  static dispose(gl, mesh) {
    if (!gl || !mesh) return;
    mesh.buffers.forEach(b => gl.deleteBuffer(b));
    gl.deleteVertexArray(mesh.vao);
    mesh.buffers = [];
    mesh.vao = null;
  }
}
