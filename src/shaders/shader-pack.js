import { ShaderProgram } from "./RenderVulkan/shader-program.js";
import { VulkanGL } from "./VulkanGL-v1.0/pack.js";

const packs = new Map([[VulkanGL.id, VulkanGL]]);
let active = VulkanGL;

const isSource = s => s && typeof s.vertex === "string" && typeof s.fragment === "string";

// Pintu tunggal ke shader. Pack buatan mod boleh parsial: shader yang tidak ada diambil dari VulkanGL.
export class ShaderPack {
  // pack: { id, name, version, shaders: { nama: { vertex, fragment } } }
  static register(pack) {
    const ok = pack && typeof pack.id === "string" && pack.shaders && Object.values(pack.shaders).every(isSource);
    if (!ok) throw new Error("Shader pack tidak valid");
    packs.set(pack.id, pack);
  }

  static use(id) {
    const pack = packs.get(id);
    if (!pack) { console.warn("[ShaderPack] pack tidak dikenal:", id); return false; }
    active = pack; // berlaku untuk program yang dibuat setelah ini
    return true;
  }

  static get(name) {
    const src = active.shaders[name] || VulkanGL.shaders[name];
    if (!src) throw new Error(`Shader "${name}" tidak ada di pack mana pun`);
    return src;
  }

  static create(gl, name) {
    const src = this.get(name);
    return ShaderProgram.create(gl, src.vertex, src.fragment);
  }
}
