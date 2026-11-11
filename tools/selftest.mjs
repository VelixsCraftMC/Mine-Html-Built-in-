// Uji logika tanpa browser: node tools/selftest.mjs
// Mencakup: komponen block, registry, atlas (dedupe), mod, dunia flat, mesher, kabut, colormap, transforplacetop.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const warns = [];
console.warn = (...a) => warns.push(a.join(" "));
globalThis.fetch = async p => {
  const f = path.join(root, p);
  if (!fs.existsSync(f)) return { ok: false, status: 404 };
  return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(f, "utf8")) };
};
globalThis.Image = class { set src(_) { setTimeout(() => this.onerror && this.onerror(), 0); } }; // tanpa PNG di Node

const imp = p => import(path.join(root, "src", p));
const { WorldLoader } = await imp("features/world/world-loader.js");
const { ChunkMesher } = await imp("features/world/chunk-mesher.js");
const { ColorMap } = await imp("features/biome/colormap.js");
const { Fog } = await imp("features/biome/fog.js");
const { Components } = await imp("features/block/components/index.js");
const { BlockLoader } = await imp("features/block/block-loader.js");
const { parseGeometry } = await imp("features/block/model-store.js");

const test = async (name, fn) => { await fn(); console.log("ok  -", name); };

const L = await WorldLoader.load();
const { registry: reg, atlas, world } = L;
const grass = reg.get("minecraft:grass_block"), dirt = reg.get("minecraft:dirt");

await test("blok bawaan terdaftar dari JSON", () => {
  assert.ok(grass && dirt);
  assert.equal(grass.displayName, "Grass Block");
  assert.deepEqual(grass.loot, [{ id: "minecraft:dirt", count: 1 }]);
  assert.deepEqual(grass.transform, { to: "minecraft:dirt", seconds: 10 });
  assert.equal(grass.carried.color.length, 3);
  assert.ok(grass.opaque && grass.full && grass.solid && grass.selectable); // bawaan: padat, penuh, bisa dipilih
});

await test("tekstur identik tidak digandakan di atlas", () => {
  assert.equal(grass.faces[1].tex, dirt.faces[0].tex); // bawah rumput = dirt, slot yang sama
  assert.equal(atlas.paths.length, 5);                  // hilang + top + side + overlay + dirt
  assert.equal(new Set(atlas.paths).size, atlas.paths.length);
  assert.ok(grass.faces[2].ov > 0 && grass.faces[0].tintBase && grass.faces[2].tintOv && !grass.faces[2].tintBase);
});

await test("komponen rusak diabaikan, blok tetap jadi", async () => {
  const before = warns.length;
  await BlockLoader.register(reg, { registry: reg, atlas: { require: () => 0, rects: null }, models: { get: async () => { throw new Error("x"); } } },
    { identifier: "minecraft:test_bad", components: { displayname: 5, loot: "x", geometry: "nope", unknown_comp: 1, transforplacetop: { to: "minecraft:dirt", tick: -1 } } }, "minecraft");
  const d = reg.get("minecraft:test_bad");
  assert.ok(d && d.displayName === "Test Bad" && d.full && d.transform === null);
  assert.ok(warns.length - before >= 4);
});

await test("komponen baru bisa didaftarkan tanpa mengubah berkas lain", async () => {
  Components.register({ id: "hardness", apply(def, v) { def.hardness = v; } });
  await BlockLoader.register(reg, { registry: reg, atlas: { require: () => 0 }, models: {} }, { identifier: "minecraft:test_h", components: { hardness: 2.5 } }, "minecraft");
  assert.equal(reg.get("minecraft:test_h").hardness, 2.5);
});

await test("dunia flat dari dimension JSON", () => {
  assert.equal(world.surface, 4);
  assert.equal(world.getBlock(8, 3, 8), grass.numId);
  assert.equal(world.getBlock(8, 2, 8), dirt.numId);
  assert.equal(world.getBlock(8, 4, 8), 0);
  assert.equal(world.groundAt(8.5, 4, 8.5), 4);
  assert.equal(world.groundAt(8.5, 3.7, 8.5), 4);
  assert.equal(world.chunks.size, 81); // radius 5 (render 4 + 1) dalam lingkaran: pi*25 ~ 81
});

await test("mesher: hanya permukaan atas yang terlihat, tint & overlay benar", () => {
  const c = world.chunks.values().next().value;
  const m = ChunkMesher.build(world, c, atlas, L.biome.grass);
  const interior = [...world.chunks.values()].find(k => k.cx === 0 && k.cz === 0);
  const mi = ChunkMesher.build(world, interior, atlas, L.biome.grass);
  assert.equal(mi.quads, 256); // 16x16 sisi atas; samping & bawah tertutup tetangga/dasar
  assert.equal(mi.idx.length, 256 * 6);
  assert.equal(mi.verts.length, 256 * 4 * 13);
  assert.equal(mi.verts[5], -1); // sisi atas tanpa overlay
  assert.ok(m.quads >= 256);
});

await test("transforplacetop: ditutup -> dirt setelah 10 detik; dibuka -> batal", () => {
  world.setBlock(8, 4, 8, dirt.numId);
  world.update(9.9, [8, 4, 8]);
  assert.equal(world.getBlock(8, 3, 8), grass.numId);
  world.update(0.2, [8, 4, 8]);
  assert.equal(world.getBlock(8, 3, 8), dirt.numId);
  world.setBlock(9, 4, 9, dirt.numId);
  world.update(5, [8, 4, 8]);
  world.setBlock(9, 4, 9, 0);
  world.update(20, [8, 4, 8]);
  assert.equal(world.getBlock(9, 3, 9), grass.numId);
  assert.equal(world.sched.timers.size, 0);
  assert.ok(world.dirty.size > 0);
});

await test("chunk dibuang saat pemain jauh, kecuali yang diubah", () => {
  const unloaded = [];
  world.onUnload = c => unloaded.push(c);
  world.update(0.1, [8 + 16 * 40, 4, 8]);
  for (let i = 0; i < 100; i++) world.update(0.016, [8 + 16 * 40, 4, 8]);
  assert.ok(unloaded.length > 70);
  assert.ok(world.has(0, 0)); // chunk yang diubah tetap ada
  assert.ok(world.chunks.size < 120);
});

await test("geometri kustom: kubus parsial tidak dianggap blok penuh", () => {
  const g = parseGeometry({ "minecraft:geometry": [{ bones: [{ cubes: [{ origin: [-8, 0, -8], size: [16, 8, 16] }] }] }] });
  assert.equal(g.full, false);
  assert.deepEqual(g.cubes[0].max, [1, 0.5, 1]);
  assert.throws(() => parseGeometry({}));
});

await test("kabut & colormap", () => {
  const f = Fog.resolve(L.biome.fog, 64);
  assert.ok(Math.abs(f.start - 58.88) < 1e-6 && f.end === 64);
  assert.equal(Fog.resolve(null, 64).end, 64);
  const map = { w: 2, h: 2, data: new Uint8Array([1, 1, 1, 255, 2, 2, 2, 255, 3, 3, 3, 255, 4, 4, 4, 255]) };
  assert.deepEqual(ColorMap.sample(map, 1, 1).map(v => Math.round(v * 255)), [1, 1, 1]);
  assert.deepEqual(ColorMap.sample(map, 0, 0).map(v => Math.round(v * 255)), [4, 4, 4]);
});

await test("mod native: dimuat, memakai ulang tekstur vanilla, rusak dilewati", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = async p => p === "mods/mods.json"
    ? { ok: true, json: async () => ({ enabled: ["example", "ghost", "../evil"] }) } : orig(p);
  const L2 = await WorldLoader.load();
  globalThis.fetch = orig;
  const g = L2.registry.get("example:glow_dirt");
  assert.ok(g && g.lightDampening === 8);
  assert.equal(g.faces[0].tex, L2.registry.get("minecraft:dirt").faces[0].tex);
  assert.equal(L2.atlas.paths.length, 5); // tidak menambah slot
  assert.equal(L2.mods.length, 1);
});

console.log(`\nSemua uji lulus (peringatan yang diharapkan: ${warns.length})`);
