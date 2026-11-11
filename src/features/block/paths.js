const SAFE = /^[\w\-./]+$/;
const ok = s => typeof s === "string" && SAFE.test(s) && !s.includes("..") && !s.startsWith("/");

// Satu-satunya tempat yang tahu letak berkas block. Namespace "minecraft" = assets/, lainnya = mods/<ns>/
export class Paths {
  static split(ref, ns) { // "mod:block/x" -> ["mod", "block/x"]; tanpa namespace -> milik pemanggil
    const i = ref.indexOf(":");
    return i < 0 ? [ns, ref] : [ref.slice(0, i), ref.slice(i + 1)];
  }

  static root(ns) { return ns === "minecraft" ? "assets/" : `mods/${ns}/`; }

  static build(ref, ns, folder, ext) {
    if (typeof ref !== "string") return null;
    const [n, p] = this.split(ref, ns);
    return ok(n) && ok(p) ? `${this.root(n)}${folder}${p}${ext}` : null;
  }

  static texture(ref, ns = "minecraft") { return this.build(ref, ns, "textures/", ".png"); }
  static model(ref, ns = "minecraft") { return this.build(ref, ns, "models/block/", ".geo.json"); }
}
