import { Color } from "../../core/color.js";

const DEFAULT_AIR = { fog_start: 0.92, fog_end: 1.0, fog_color: "#C0D8FF", render_distance_type: "render" };

export class Fog {
  // fog_settings (JSON) -> { start, end, color } dalam blok.
  // render_distance_type "render" = pecahan jarak render, "fixed" = blok. Tanpa data = kabut udara bawaan.
  static resolve(settings, renderBlocks) {
    const air = settings && settings.distance && settings.distance.air || DEFAULT_AIR;
    const k = air.render_distance_type === "fixed" ? 1 : renderBlocks;
    const start = (Number.isFinite(air.fog_start) ? air.fog_start : 0.92) * k;
    let end = (Number.isFinite(air.fog_end) ? air.fog_end : 1) * k;
    if (end <= start + 0.01) end = start + 0.01;
    return { start, end, color: Color.hex(air.fog_color) || Color.hex(DEFAULT_AIR.fog_color) };
  }
}
