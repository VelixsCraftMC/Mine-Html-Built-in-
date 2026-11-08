import { Mat4 } from "../../core/math/mat4.js";

// Urutan tombol perspektif Minecraft: Dalam -> Belakang -> Depan -> Dalam
export const PerspectiveMode = {
  FIRST_PERSON: 0,
  THIRD_PERSON_BACK: 1,
  THIRD_PERSON_FRONT: 2
};

const MODE_COUNT = 3;
const BASE_SENSITIVITY = 0.0035; // rad per piksel geser pada skala 1,0
const THIRD_PERSON_DIST = 4.0;  // jarak kamera orang ketiga (blok)
const EYE_HEIGHT = 1.62;        // tinggi mata awal (selanjutnya diatur lewat follow)
const NEAR = 0.05;
const FAR = 1000.0;
const MAX_PITCH = (89.5 * Math.PI) / 180;

export class Camera {
  constructor(fovDeg = 70) {
    this.fovRad = (fovDeg * Math.PI) / 180;
    this.yaw = 0;
    this.pitch = 0;
    this.sensitivity = BASE_SENSITIVITY;
    this.mode = PerspectiveMode.FIRST_PERSON;

    this.viewMatrix = Mat4.create();
    this.projMatrix = Mat4.create();
    this.viewProjMatrix = Mat4.create();
    this.invViewProj = Mat4.create();
    // Vektor prealokasi agar tidak ada alokasi per frame
    this.backOffset = [0, 0, 0];
    this.eyeOffset = [0, -EYE_HEIGHT, 0];
    this.tmp = Mat4.create();
    this.position = [0, 0, 0]; // posisi kamera di dunia (termasuk orbit orang ketiga)
  }

  // Kamera mengikuti titik mata pemain (pos = posisi kaki, eye = tinggi mata)
  follow(pos, eye) {
    this.eyeOffset[0] = -pos[0];
    this.eyeOffset[1] = -(pos[1] + eye);
    this.eyeOffset[2] = -pos[2];
  }

  // scale: pengali dari option.json (cameraSensitivity)
  setSensitivityScale(scale) {
    this.sensitivity = BASE_SENSITIVITY * scale;
  }

  cyclePerspective() {
    this.mode = (this.mode + 1) % MODE_COUNT;
    return this.mode;
  }

  rotate(deltaX, deltaY) {
    this.yaw += deltaX * this.sensitivity;
    this.pitch -= deltaY * this.sensitivity;
    if (this.pitch > MAX_PITCH) this.pitch = MAX_PITCH;
    if (this.pitch < -MAX_PITCH) this.pitch = -MAX_PITCH;
  }

  // bob (opsional): matriks view bobbing, hanya dipakai di orang pertama
  update(aspect, bob = null) {
    Mat4.perspective(this.projMatrix, this.fovRad, aspect, NEAR, FAR);

    let yaw = this.yaw;
    let pitch = this.pitch;
    let dist = 0.0;

    if (this.mode === PerspectiveMode.THIRD_PERSON_FRONT) {
      // Seperti Minecraft: yaw +180 dan pitch dibalik, kamera menghadap wajah
      yaw += Math.PI;
      pitch = -pitch;
      dist = THIRD_PERSON_DIST;
    } else if (this.mode === PerspectiveMode.THIRD_PERSON_BACK) {
      dist = THIRD_PERSON_DIST;
    }

    const m = this.viewMatrix;
    for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;

    // Kamera mengorbit titik mata sejauh dist (termasuk pitch)
    if (dist > 0) {
      this.backOffset[2] = -dist;
      Mat4.translate(m, m, this.backOffset);
    }
    Mat4.rotateX(m, m, pitch);
    Mat4.rotateY(m, m, yaw);
    Mat4.translate(m, m, this.eyeOffset);
    if (bob && this.mode === PerspectiveMode.FIRST_PERSON) {
      Mat4.multiply(this.tmp, bob, m);
      Mat4.copy(m, this.tmp);
    }

    // View = [R | t] kaku -> posisi dunia = -R^T * t
    const c = this.position;
    c[0] = -(m[0] * m[12] + m[1] * m[13] + m[2] * m[14]);
    c[1] = -(m[4] * m[12] + m[5] * m[13] + m[6] * m[14]);
    c[2] = -(m[8] * m[12] + m[9] * m[13] + m[10] * m[14]);

    Mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
    Mat4.invert(this.invViewProj, this.viewProjMatrix);
  }

  getInvViewProj() {
    return this.invViewProj;
  }
}
