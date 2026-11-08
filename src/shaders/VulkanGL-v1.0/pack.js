import { PlayerShader } from "./player.js";
import { SkyShader } from "./sky.js";
import { SunShader } from "./sun.js";
import { CloudShader } from "./cloud.js";
import { NametagShader } from "./nametag.js";

// Shader pack bawaan. Kunci di 'shaders' = nama yang dipakai fitur lewat ShaderPack.create(gl, nama).
export const VulkanGL = {
  id: "shaders.vulkangl",
  name: "VulkanGL",
  version: "1.0",
  shaders: {
    player: PlayerShader,
    sky: SkyShader,
    sun: SunShader,
    clouds: CloudShader,
    nametag: NametagShader
  }
};
