import { ShaderProgram } from "../../shaders/RenderVulkan/shader-program.js";
import { ShaderPack } from "../../shaders/shader-pack.js";
import { ChunkMesher } from "./chunk-mesher.js";
import { ChunkVao } from "./chunk-vao.js";

const MESH_BUDGET = 3; // chunk yang di-mesh per frame

// Menggambar chunk: satu atlas, satu program shader, satu draw per chunk. Semua sumber daya GPU dilepas di dispose().
export class WorldRenderer {
  constructor(glContext, loaded) {
    this.gl = glContext.getGL();
    this.loaded = loaded;
    this.world = loaded.world;
    this.program = ShaderPack.create(this.gl, "blocks");
    const gl = this.gl, p = this.program;
    this.u = Object.fromEntries(["viewProj", "chunk", "cam", "atlas", "fogColor", "fog"]
      .map(n => [n, gl.getUniformLocation(p, "u_" + n)]));
    this.ready = false;
    this.disposed = false;
    this.world.onUnload = c => this.free(c);
    loaded.atlas.build(gl).then(() => { this.ready = !this.disposed; }).catch(e => console.error("[World] atlas gagal:", e));
  }

  free(chunk) {
    ChunkVao.dispose(this.gl, chunk.mesh);
    chunk.mesh = null;
  }

  remesh(chunk) {
    const data = ChunkMesher.build(this.world, chunk, this.loaded.atlas, this.loaded.biome.grass);
    if (!data) return this.free(chunk);
    chunk.mesh = ChunkVao.upload(this.gl, chunk.mesh, data);
  }

  render(camera) {
    if (!this.ready) return;
    const gl = this.gl, L = this.loaded, f = L.fog;
    for (const c of this.world.takeDirty(MESH_BUDGET)) this.remesh(c);
    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, L.atlas.texture);
    gl.uniform1i(this.u.atlas, 0);
    gl.uniformMatrix4fv(this.u.viewProj, false, camera.viewProjMatrix);
    gl.uniform3fv(this.u.cam, camera.position);
    gl.uniform3fv(this.u.fogColor, f.color);
    gl.uniform2f(this.u.fog, f.start, f.end);
    for (const c of this.world.chunks.values()) {
      if (!c.mesh) continue;
      gl.uniform3f(this.u.chunk, c.cx * 16, 0, c.cz * 16);
      ChunkVao.draw(gl, c.mesh);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.CULL_FACE);
  }

  dispose() {
    this.disposed = true;
    this.world.onUnload = null;
    for (const c of this.world.chunks.values()) this.free(c);
    this.loaded.atlas.dispose(this.gl);
    ShaderProgram.dispose(this.gl, this.program);
    this.program = null;
    this.gl = null;
  }
}
