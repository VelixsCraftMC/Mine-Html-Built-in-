import { Mat4 } from "../../core/math/mat4.js";

export const PerspectiveMode = {
  FIRST_PERSON: 0,       // Kamera Dalam
  THIRD_PERSON_FRONT: 1, // Kamera Depan (melihat wajah)
  THIRD_PERSON_BACK: 2   // Kamera Belakang (melihat punggung)
};

export class Camera {
  constructor(fovDeg = 70) {
    this.fovRad = (fovDeg * Math.PI) / 180;
    this.yaw = 0;
    this.pitch = 0;
    this.sensitivity = 0.0035;
    this.mode = PerspectiveMode.FIRST_PERSON;

    this.viewMatrix = Mat4.create();
    this.projMatrix = Mat4.create();
    this.viewProjMatrix = Mat4.create();
    this.invViewProj = Mat4.create();
  }

  cyclePerspective() {
    // Urutan: Depan -> Belakang -> Dalam
    if (this.mode === PerspectiveMode.FIRST_PERSON) {
      this.mode = PerspectiveMode.THIRD_PERSON_FRONT;
    } else if (this.mode === PerspectiveMode.THIRD_PERSON_FRONT) {
      this.mode = PerspectiveMode.THIRD_PERSON_BACK;
    } else {
      this.mode = PerspectiveMode.FIRST_PERSON;
    }
    return this.mode;
  }

  rotate(deltaX, deltaY) {
    this.yaw += deltaX * this.sensitivity;
    this.pitch -= deltaY * this.sensitivity;

    const maxPitch = (89.5 * Math.PI) / 180;
    if (this.pitch > maxPitch) this.pitch = maxPitch;
    if (this.pitch < -maxPitch) this.pitch = -maxPitch;
  }

  update(aspect) {
    Mat4.perspective(this.projMatrix, this.fovRad, aspect, 0.1, 1000.0);

    // Standard Minecraft: Jarak Third-Person adalah 4.0 meter
    let curYaw = this.yaw;
    let curPitch = this.pitch;
    let dist = 0.0;

    if (this.mode === PerspectiveMode.THIRD_PERSON_FRONT) {
      curYaw = this.yaw + Math.PI; // Putar balik 180 derajat menghadap wajah
      curPitch = -this.pitch;      // Invert pitch agar tetap memfokuskan kepala
      dist = 4.0;
    } else if (this.mode === PerspectiveMode.THIRD_PERSON_BACK) {
      dist = 4.0;                  // Mundur 4 blok melihat punggung
    }

    // Bangun View Matrix
    const cosY = Math.cos(curYaw), sinY = Math.sin(curYaw);
    const cosP = Math.cos(curPitch), sinP = Math.sin(curPitch);

    const m = this.viewMatrix;
    for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;

    // Geser kamera mundur sejauh 'dist' blok
    if (dist > 0) Mat4.translate(m, m, [0, 0, -dist]);

    // Terapkan rotasi pandangan
    Mat4.rotateX(m, m, curPitch);
    Mat4.rotateY(m, m, curYaw);

    // Pivot tinggi mata pemain Minecraft (1.62 meter)
    Mat4.translate(m, m, [0, -1.62, 0]);

    Mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
    Mat4.invert(this.invViewProj, this.viewProjMatrix);
  }

  getInvViewProj() {
    return this.invViewProj;
  }
}