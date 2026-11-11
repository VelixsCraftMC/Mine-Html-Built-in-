// Gabungkan semua modul + aset jadi satu file: dist/minehtml.js (+ dist/index.html, DEVLOG.md).
// Pakai: node tools/build.mjs      Tambah catatan rilis: edit devlog.json (entri teratas = versi terbaru).
import fs from "node:fs";
import path from "node:path";
import { writeBlockIndex } from "./index.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const devlog = JSON.parse(read("devlog.json"));
const version = devlog[0].version;

// 1) Aset tertanam: assets/, dimension/, mods/ (PNG -> data URI, JSON diringkas; sounds/ tidak ditanam)
writeBlockIndex();
const MAP = {}, TEXT = {};
const SKIP = new Set(["sounds"]);
function walk(dir) {
  for (const f of fs.readdirSync(path.join(root, dir))) {
    const rel = path.posix.join(dir, f), abs = path.join(root, rel);
    if (fs.statSync(abs).isDirectory()) { if (!SKIP.has(f)) walk(rel); }
    else if (f.endsWith(".png")) MAP[rel] = "data:image/png;base64," + fs.readFileSync(abs).toString("base64");
    else if (f.endsWith(".json")) TEXT[rel] = JSON.stringify(JSON.parse(fs.readFileSync(abs, "utf8")));
  }
}
["assets", "dimension", "mods"].forEach(walk);
TEXT["option.json"] = JSON.stringify(JSON.parse(read("option.json")));

const assetsModule = `
const IMG = ${JSON.stringify(MAP)};
const TXT = ${JSON.stringify(TEXT)};
export class Assets {
  static url(p) { return IMG[p] || p; }
  static fetch(p, init) {
    if (p === "option.json") { // window.MineHTMLOptions menimpa nilai bawaan
      const base = JSON.parse(TXT[p]), o = window.MineHTMLOptions || {};
      const merged = { ...base, ...o, touchCircle: { ...base.touchCircle, ...(o.touchCircle || {}) } };
      return Promise.resolve(new Response(JSON.stringify(merged), { headers: { "Content-Type": "application/json" } }));
    }
    if (TXT[p]) return Promise.resolve(new Response(TXT[p], { headers: { "Content-Type": "application/json" } }));
    return fetch(p, init);
  }
}`;

// 2) Bundler modul ES -> IIFE satu file (urutan dependensi, tanpa siklus)
const done = new Map(), out = [];
const id = p => "m" + p.replace(/[^\w]/g, "_");
function visit(rel) {
  if (done.has(rel)) return;
  done.set(rel, true);
  let src = rel === "src/core/assets.js" ? assetsModule : read(rel);
  const deps = [], names = [];
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*"([^"]+)";?[ \t]*$/gm, (_, list, from) => {
    const dep = path.posix.normalize(path.posix.join(path.posix.dirname(rel), from));
    deps.push(dep);
    return `const {${list.replace(/\s+as\s+/g, ": ")}} = ${id(dep)};`;
  });
  deps.forEach(visit);
  src = src.replace(/^export\s+(class|const|function|let)\s+(\w+)/gm, (_, kw, n) => (names.push(n), `${kw} ${n}`));
  if (/^export\s/m.test(src)) throw new Error("export tidak didukung bundler di " + rel);
  out.push(`const ${id(rel)} = (() => {\n${src}\nreturn { ${names.join(", ")} };\n})();`);
}
visit("src/main.js");

const banner = `/*! MineHTML ${version} | satu file: JS + aset tertanam, tanpa CSS | dibuat ${new Date().toISOString().slice(0, 10)} */`;
const info = `window.MineHTML = { version: ${JSON.stringify(version)}, devlog: ${JSON.stringify(devlog)} };
console.info("%cMineHTML " + MineHTML.version, "font-weight:bold", "\\n- " + MineHTML.devlog[0].changes.join("\\n- "));`;
const bundle = `${banner}\n(() => {\n"use strict";\n${info}\n${out.join("\n")}\n})();\n`;

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/minehtml.js"), bundle);
fs.writeFileSync(path.join(root, "dist/index.html"),
  `<!DOCTYPE html>\n<html lang="id"><head><meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n<title>MineHTML</title></head>\n<body><script src="minehtml.js"></script></body></html>\n`);
fs.writeFileSync(path.join(root, "DEVLOG.md"), "# Devlog\n\n" + devlog.map(e =>
  `## ${e.version} (${e.date})\n${e.changes.map(c => "- " + c).join("\n")}\n`).join("\n"));
console.log(`dist/minehtml.js  ${(bundle.length / 1024).toFixed(1)} KB (${out.length} modul, ${Object.keys(MAP).length} gambar)`);
