// Skema option.json: tiap kolom punya 'def' (default) dan 'check' (kembalikan nilai bersih,
// atau undefined bila tidak valid). Menambah opsi baru = menambah satu baris di sini.
const num = (def, min, max) => ({
  def,
  check: v => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : undefined)
});

const bool = def => ({ def, check: v => (typeof v === "boolean" ? v : undefined) });

const name = def => ({
  def,
  check: v => {
    if (typeof v !== "string") return undefined;
    const t = v.replace(/[\u0000-\u001f\u007f]/g, "").trim();
    return t.length >= 1 && t.length <= 16 ? t : undefined;
  }
});

// Path relatif ke .png; tanpa protokol, tanpa "/" di depan, tanpa "..". allowEmpty: "" = tidak dipakai
const PNG_PATH = /^(?![a-z][a-z0-9+.-]*:|\/|.*\.\.)[\w\-./ ]+\.png$/i;
const png = (def, allowEmpty = false) => ({
  def,
  check: v => {
    if (typeof v !== "string") return undefined;
    const t = v.trim();
    if (t === "") return allowEmpty ? "" : undefined;
    return PNG_PATH.test(t) ? t : undefined;
  }
});

export const OptionSchema = {
  playerName: name("Steve"),
  cameraSensitivity: num(1.0, 0.1, 5.0), // pengali sensitivitas dasar kamera
  touchCircle: {
    enabled: bool(true),
    size: num(72, 32, 160)               // diameter cincin sentuh (px)
  },
  skinPath: png("assets/skins/steve.png"),
  capePath: png("assets/cape/cape.png", true)
};
