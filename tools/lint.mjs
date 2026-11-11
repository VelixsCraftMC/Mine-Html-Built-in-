// Pemeriksaan struktur: node tools/lint.mjs
// - batas baris per berkas kode, JSON valid, tekstur identik (isi sama) tidak digandakan,
//   folder fitur punya manifest.json, indeks block sinkron dengan isi folder.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { writeBlockIndex } from "./index.mjs";

const LIMIT = 150;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const problems = [];
const files = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(e => {
  const rel = path.posix.join(dir, e.name);
  return e.isDirectory() ? files(rel) : [rel];
});

for (const f of files("src")) {
  if (f.endsWith(".js")) {
    const n = fs.readFileSync(path.join(root, f), "utf8").split("\n").length;
    if (n > LIMIT) problems.push(`${f}: ${n} baris (batas ${LIMIT})`);
  }
}
for (const f of [...files("assets"), ...files("src"), ...files("dimension"), ...files("mods")]) {
  if (f.endsWith(".json") && !f.includes("/sounds/")) {
    try { JSON.parse(fs.readFileSync(path.join(root, f), "utf8")); } catch (e) { problems.push(`${f}: JSON tidak valid`); }
  }
}
const seen = new Map();
for (const f of files("assets/textures")) {
  if (!f.endsWith(".png")) continue;
  const h = crypto.createHash("sha1").update(fs.readFileSync(path.join(root, f))).digest("hex");
  if (seen.has(h)) problems.push(`tekstur identik: ${f} == ${seen.get(h)} (cukup rujuk satu path)`);
  else seen.set(h, f);
}
for (const d of ["core", "features", "shaders"]) {
  for (const e of fs.readdirSync(path.join(root, "src", d), { withFileTypes: true })) {
    if (d !== "core" && e.isDirectory() && !fs.existsSync(path.join(root, "src", d, e.name, "manifest.json"))) {
      problems.push(`src/${d}/${e.name}: tidak ada manifest.json`);
    }
  }
}
const before = fs.readFileSync(path.join(root, "assets/block/index.json"), "utf8");
writeBlockIndex();
if (before !== fs.readFileSync(path.join(root, "assets/block/index.json"), "utf8")) problems.push("assets/block/index.json tidak sinkron (sudah diperbarui, commit ulang)");

console.log(problems.length ? problems.join("\n") : "lint: bersih");
process.exit(problems.length ? 1 : 0);
