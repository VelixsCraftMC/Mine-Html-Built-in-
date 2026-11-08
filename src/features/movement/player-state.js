import { Mat4 } from "../../core/math/mat4.js";
import { MoveConfig } from "./config.js";

// Data gerak pemain (tanpa logika). Dibaca kamera, renderer, dan gerbang aksi.
export class PlayerState {
  constructor() {
    this.pos = [0, 0, 0];      // posisi kaki (x, y, z)
    this.vel = [0, 0, 0];
    this.onGround = true;
    this.flying = false;
    this.sneaking = false;
    this.sprinting = false;
    this.crouch = false;       // pose jongkok (tidak aktif saat terbang, seperti Java)
    this.sneakAmt = 0;         // 0..1 halus, untuk pose jongkok dan tinggi mata
    this.moving = false;
    this.eye = MoveConfig.eyeHeight;
    this.walkDist = 0;         // jarak langkah (view bobbing)
    this.bobAmt = 0;
    this.bob = Mat4.create();  // matriks view bobbing (ruang kamera)
  }
}
