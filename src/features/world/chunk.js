export const CHUNK = 16;

// Penyimpanan satu chunk 16 x height x 16: Uint16 id blok, indeks = (y * 16 + z) * 16 + x
export class Chunk {
  constructor(cx, cz, height) {
    this.cx = cx;
    this.cz = cz;
    this.height = height;
    this.data = new Uint16Array(CHUNK * CHUNK * height);
    this.top = 0;          // 1 + y blok tertinggi yang terisi (batas pindai mesher)
    this.modified = false; // diubah pemain/skrip: tidak boleh dibuang dari memori
    this.mesh = null;      // milik renderer (handle GPU)
  }

  get(lx, y, lz) { return this.data[(y * CHUNK + lz) * CHUNK + lx]; }

  set(lx, y, lz, id) {
    this.data[(y * CHUNK + lz) * CHUNK + lx] = id;
    if (id !== 0 && y >= this.top) this.top = y + 1;
    else if (id === 0 && y === this.top - 1) this.recomputeTop();
  }

  recomputeTop() {
    let y = this.top - 1;
    while (y >= 0 && !this.hasLayer(y)) y--;
    this.top = y + 1;
  }

  hasLayer(y) {
    const s = y * CHUNK * CHUNK;
    for (let i = s; i < s + CHUNK * CHUNK; i++) if (this.data[i] !== 0) return true;
    return false;
  }
}
