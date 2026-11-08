// Semua angka gerakan ada di sini agar mudah diubah/dimodifikasi tanpa menyentuh logika.
export const MoveConfig = Object.freeze({
  walkSpeed: 4.317,      // blok/detik (jalan Minecraft)
  sneakSpeed: 1.295,     // 30% dari jalan
  sprintMul: 1.3,        // lari = 5,6 blok/detik
  flySprintMul: 2.0,
  flySpeed: 10.89,       // terbang kreatif
  flyUpSpeed: 7.5,       // naik saat tombol lompat ditahan
  flyDownSpeed: 7.5,     // turun saat jongkok aktif
  flyDamp: 0.0005,        // sisa kecepatan setelah 1 detik (makin kecil = makin cepat berhenti)
  airDamp: 0.00001,      // kontrol horizontal saat di udara
  jumpSpeed: 9.0,        // tinggi lompat sekitar 1,26 blok
  gravity: 32.0,
  terminalSpeed: 78.4,
  eyeHeight: 1.62,
  sneakEyeDrop: 0.35,    // mata turun menjadi 1,27 saat jongkok
  doubleTapMs: 300,      // dua kali tap lompat = terbang/berhenti terbang
  mineInAir: false       // false = tahan memukul tidak berfungsi di udara
});
