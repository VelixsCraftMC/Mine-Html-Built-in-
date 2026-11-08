// Status input gerak. Diisi oleh UI sentuh (atau sumber lain), dibaca oleh fisika.
export class MoveInput {
  constructor() {
    this.forward = false;
    this.back = false;
    this.left = false;
    this.right = false;
    this.jump = false;
    this.sneak = false;      // toggle seperti Minecraft PE
    this.sprint = false;     // toggle; berhenti saat maju dilepas atau jongkok
    this.flyToggle = false;  // pulsa satu kali
  }

  setDirs(f, b, l, r) {
    this.forward = f; this.back = b; this.left = l; this.right = r;
  }

  consumeFlyToggle() {
    const v = this.flyToggle;
    this.flyToggle = false;
    return v;
  }
}
