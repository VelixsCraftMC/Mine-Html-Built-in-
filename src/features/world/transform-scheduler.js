// Menjalankan komponen "transforplacetop": blok yang ditutup berubah setelah N detik (waktu nyata, bukan frame).
export class TransformScheduler {
  constructor() { this.timers = new Map(); }

  // Dipanggil World.setBlock: blok di (x,y,z) dan blok di bawahnya mungkin berubah statusnya
  onChange(world, x, y, z) {
    this.check(world, x, y - 1, z);
    this.check(world, x, y, z);
  }

  check(world, x, y, z) {
    const def = world.defAt(x, y, z), key = `${x},${y},${z}`;
    if (def.transform && world.getBlock(x, y + 1, z) > 0) {
      const t = this.timers.get(key);
      if (!t || t.id !== def.numId) this.timers.set(key, { x, y, z, id: def.numId, left: def.transform.seconds });
    } else this.timers.delete(key);
  }

  update(world, dt) {
    for (const [key, t] of this.timers) {
      t.left -= dt;
      if (t.left > 0) continue;
      this.timers.delete(key);
      const def = world.defAt(t.x, t.y, t.z);
      const to = def.transform ? world.reg.idOf(def.transform.to) : -1;
      if (def.numId === t.id && to >= 0 && world.getBlock(t.x, t.y + 1, t.z) > 0) world.setBlock(t.x, t.y, t.z, to);
    }
  }
}
