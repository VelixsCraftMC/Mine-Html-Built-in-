// Pintu tunggal aset. Mode dev: path apa adanya. Bundle (tools/build.mjs): modul ini diganti
// versi dengan semua aset tertanam (data URI), jadi satu file JS tanpa CSS/berkas lain.
export class Assets {
  static url(path) { return path; }
  static fetch(path, init) { return fetch(path, init); }
}
