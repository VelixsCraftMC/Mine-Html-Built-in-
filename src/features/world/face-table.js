// Urutan sisi sama dengan DIRS di model-store: up, down, north, south, east, west.
// Tiap sudut: [sx, sy, sz, su, sv]; sx/sy/sz 0 = min, 1 = max kubus; su/sv = sudut UV (0..1).
// Urutan sudut berlawanan arah jarum jam dilihat dari luar (CULL_FACE BACK).
export const FACES = [
  { n: [0, 1, 0], shade: 1.0, c: [[0, 1, 1, 0, 1], [1, 1, 1, 1, 1], [1, 1, 0, 1, 0], [0, 1, 0, 0, 0]] },
  { n: [0, -1, 0], shade: 0.5, c: [[0, 0, 0, 0, 0], [1, 0, 0, 1, 0], [1, 0, 1, 1, 1], [0, 0, 1, 0, 1]] },
  { n: [0, 0, -1], shade: 0.8, c: [[1, 0, 0, 0, 1], [0, 0, 0, 1, 1], [0, 1, 0, 1, 0], [1, 1, 0, 0, 0]] },
  { n: [0, 0, 1], shade: 0.8, c: [[0, 0, 1, 0, 1], [1, 0, 1, 1, 1], [1, 1, 1, 1, 0], [0, 1, 1, 0, 0]] },
  { n: [1, 0, 0], shade: 0.6, c: [[1, 0, 1, 0, 1], [1, 0, 0, 1, 1], [1, 1, 0, 1, 0], [1, 1, 1, 0, 0]] },
  { n: [-1, 0, 0], shade: 0.6, c: [[0, 0, 0, 0, 1], [0, 0, 1, 1, 1], [0, 1, 1, 1, 0], [0, 1, 0, 0, 0]] }
];
