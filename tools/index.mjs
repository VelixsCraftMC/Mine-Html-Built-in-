// Membuat assets/block/index.json dari isi folder assets/block/**.json (server statis tidak bisa membaca folder).
// Pakai: node tools/index.mjs   (build.mjs memanggilnya otomatis)
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

export function writeBlockIndex() {
  const dir = path.join(root, "assets/block"), blocks = [];
  (function walk(rel) {
    for (const f of fs.readdirSync(path.join(dir, rel)).sort()) {
      const r = rel ? `${rel}/${f}` : f;
      if (fs.statSync(path.join(dir, r)).isDirectory()) walk(r);
      else if (f.endsWith(".json") && r !== "index.json") blocks.push(r);
    }
  })("");
  fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify({ blocks }, null, 2) + "\n");
  return blocks;
}

if (process.argv[1] === new URL(import.meta.url).pathname) console.log("assets/block/index.json:", writeBlockIndex().join(", "));
