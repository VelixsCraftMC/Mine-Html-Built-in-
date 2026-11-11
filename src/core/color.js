const HEX = /^#([0-9a-f]{6})$/i;

export class Color {
  // "#RRGGBB" -> [r, g, b] 0..1, atau null bila tidak valid
  static hex(str) {
    const m = typeof str === "string" ? HEX.exec(str.trim()) : null;
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
}
