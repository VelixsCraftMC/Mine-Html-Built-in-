/*! MineHTML 1.3.0 | satu file: JS + aset tertanam, tanpa CSS | dibuat 2026-11-11 */
(() => {
"use strict";
window.MineHTML = { version: "1.3.0", devlog: [{"version":"1.3.0","date":"2026-11-11","changes":["Block berbasis JSON: assets/block/**/*.json = { identifier, components }; satu komponen = satu berkas JS di src/features/block/components (displayname, category, geometry, textures, loot, transforplacetop, collision, selection, lightdampening)","Komponen baru cukup berkas baru + satu baris di components/index.js; komponen rusak/tidak dikenal dilewati, blok tetap jadi","Assets dipecah: models/{block,entity,item}, textures/{block,colormap}, particles, biome, fog, minimap, sounds. Model pemain pindah ke assets/models/entity/player/","Tekstur satu blok banyak sisi di satu folder; path yang sama = satu slot atlas (tanpa duplikat). Rumput: overlay samping diwarnai biome","Dunia dari dimension/overworld.flat.json (di luar core): chunk Uint16, generator terdaftar, streaming + pembuangan chunk jauh, mesher face-culling, kabut dari biome/fog","Warna rumput dari colormap (suhu/curah hujan biome); fisika pemain memakai world.groundAt","transforplacetop: blok yang ditutup berubah setelah N detik (waktu nyata)","mods/ sementara: mods/mods.json memilih mod aktif, mods/<id>/manifest.json; mod rusak dilewati","tools/index.mjs (indeks block otomatis), tools/selftest.mjs (uji logika), tools/lint.mjs (batas baris, JSON, tekstur ganda, manifest)","Bundle satu file kini menanam assets/, dimension/, mods/ (sounds/ tidak ditanam)"]},{"version":"1.2.0","date":"2026-11-11","changes":["Awan 3D ala Minecraft Java: sel 12x12 blok, tebal 4 blok, alpha 0,8, shade muka atas 1.0 / timur-barat 0.9 / utara-selatan 0.8 / bawah 0.7","Awan bisa dilihat dari atas dan dari dalam lapisan awan; ray-march grid di shader, tanpa geometri","CloudConfig: height, thickness, cell, wind, alpha, fade dalam satu objek","Build satu file minehtml.js (aset tertanam, tanpa CSS/berkas lain): node tools/build.mjs","Assets: pintu tunggal aset (dev = path, bundle = data URI)","Opsi bisa ditimpa lewat window.MineHTMLOptions sebelum minehtml.js dimuat"]}] };
console.info("%cMineHTML " + MineHTML.version, "font-weight:bold", "\n- " + MineHTML.devlog[0].changes.join("\n- "));
const msrc_core_platform_device_guard_js = (() => {
class DeviceGuard {
  static validate() {
    // Injeksi styling global murni dari JS
    document.documentElement.style.cssText = 
      "margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;-webkit-user-select:none;user-select:none;";
    document.body.style.cssText = 
      "margin:0;padding:0;width:100%;height:100%;overflow:hidden;touch-action:none;";

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (!isTouch || !isAndroid) {
      this.renderBlockScreen();
      return false;
    }
    return true;
  }

  static renderBlockScreen() {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;top:0;left:0;width:100vw;height:100vh;
      display:flex;align-items:center;justify-content:center;
      background:#111;color:#ff5555;font-family:monospace;
      text-align:center;padding:24px;box-sizing:border-box;z-index:999999;
    `;
    el.innerHTML = `
      <div>
        <h2 style="margin:0 0 10px 0;">AKSES DITOLAK</h2>
        <p style="color:#aaa;font-size:14px;margin:0;">
          MineHTML hanya dirancang untuk perangkat Android dengan Layar Sentuh.
        </p>
      </div>
    `;
    document.body.appendChild(el);
  }
}
return { DeviceGuard };
})();
const msrc_core_platform_orientation_lock_js = (() => {
class OrientationLock {
  static init() {
    const requestLandscape = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock("landscape");
        }
      } catch (_) {
        // Fallback untuk browser yang membatasi API orientasi otomatis
      }
    };

    window.addEventListener("touchstart", requestLandscape, { once: true, passive: true });
    this.injectPrompt();
  }

  static injectPrompt() {
    const prompt = document.createElement("div");
    prompt.id = "orientation-hint";
    prompt.style.cssText = `
      position:fixed;top:10px;left:50%;transform:translateX(-50%);
      color:rgba(255,255,255,0.7);font-family:monospace;font-size:12px;
      pointer-events:none;z-index:1000;text-shadow:1px 1px #000;
    `;
    prompt.innerText = "Sentuh layar untuk Fullscreen & Landscape";
    document.body.appendChild(prompt);

    window.addEventListener("touchstart", () => {
      if (prompt.parentNode) prompt.parentNode.removeChild(prompt);
    }, { once: true, passive: true });
  }
}
return { OrientationLock };
})();
const msrc_shaders_RenderVulkan_webgl_context_js = (() => {
class WebGLContext {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
    document.body.appendChild(this.canvas);

    const opts = {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false
    };

    this.gl = this.canvas.getContext("webgl2", opts);
    if (!this.gl) {
      throw new Error("WebGL2 tidak didukung pada perangkat ini.");
    }

    this.boundResize = this.resize.bind(this);
    window.addEventListener("resize", this.boundResize, { passive: true });
    window.addEventListener("orientationchange", this.boundResize, { passive: true });
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 untuk efisiensi GPU Android
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  getGL() {
    return this.gl;
  }

  getAspect() {
    return this.canvas.width / (this.canvas.height || 1);
  }

  dispose() {
    window.removeEventListener("resize", this.boundResize);
    window.removeEventListener("orientationchange", this.boundResize);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.gl = null;
    this.canvas = null;
  }
}
return { WebGLContext };
})();
const msrc_core_input_touch_look_js = (() => {
class TouchLook {
  constructor(canvas) {
    this.canvas = canvas;
    this.activeTouchId = null;
    this.prevX = 0;
    this.prevY = 0;
    this.deltaX = 0;
    this.deltaY = 0;

    this.onTouchStart = this.handleStart.bind(this);
    this.onTouchMove = this.handleMove.bind(this);
    this.onTouchEnd = this.handleEnd.bind(this);

    this.bindEvents();
  }

  bindEvents() {
    this.canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
    this.canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
    this.canvas.addEventListener("touchend", this.onTouchEnd, { passive: false });
    this.canvas.addEventListener("touchcancel", this.onTouchEnd, { passive: false });
  }

  handleStart(e) {
    e.preventDefault();
    if (this.activeTouchId !== null) return;
    const t = e.changedTouches[0];
    this.activeTouchId = t.identifier;
    this.prevX = t.clientX;
    this.prevY = t.clientY;
  }

  handleMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.activeTouchId) {
        this.deltaX += t.clientX - this.prevX;
        this.deltaY += t.clientY - this.prevY;
        this.prevX = t.clientX;
        this.prevY = t.clientY;
        break;
      }
    }
  }

  handleEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.activeTouchId) {
        this.activeTouchId = null;
        break;
      }
    }
  }

  consumeDelta() {
    const dx = this.deltaX;
    const dy = this.deltaY;
    this.deltaX = 0;
    this.deltaY = 0;
    return { dx, dy };
  }

  dispose() {
    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    this.canvas.removeEventListener("touchmove", this.onTouchMove);
    this.canvas.removeEventListener("touchend", this.onTouchEnd);
    this.canvas.removeEventListener("touchcancel", this.onTouchEnd);
    this.canvas = null;
  }
}
return { TouchLook };
})();
const msrc_core_input_touch_action_js = (() => {
const HOLD_MS = 350; // tahan >= ini = menghancurkan (Minecraft PE)
const RING_DELAY_MS = 90; // cincin baru muncul setelah ditahan sebentar (tap cepat tidak berkedip)
const SLOP_PX = 12;  // geser lebih dari ini = mengarahkan kamera, bukan tap/tahan

// Membedakan tap (serang) dan tahan (hancurkan) dari sentuhan pertama.
// Tanpa timer: status dihitung saat dipolling, jadi tidak ada callback yang bocor.
class TouchAction {
  constructor(canvas, now = () => performance.now()) {
    this.canvas = canvas;
    this.now = now;
    this.touchId = null;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.moved = false;
    this.holding = false;
    this.attackQueued = false;

    this.onStart = this.handleStart.bind(this);
    this.onMove = this.handleMove.bind(this);
    this.onEnd = this.handleEnd.bind(this);
    const opt = { passive: true };
    canvas.addEventListener("touchstart", this.onStart, opt);
    canvas.addEventListener("touchmove", this.onMove, opt);
    canvas.addEventListener("touchend", this.onEnd, opt);
    canvas.addEventListener("touchcancel", this.onEnd, opt);
  }

  findTouch(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) return e.changedTouches[i];
    }
    return null;
  }

  handleStart(e) {
    if (this.touchId !== null) return;
    const t = e.changedTouches[0];
    this.touchId = t.identifier;
    this.startX = t.clientX;
    this.startY = t.clientY;
    this.startTime = this.now();
    this.moved = false;
    this.holding = false;
  }

  handleMove(e) {
    if (this.touchId === null || this.moved || this.holding) return;
    const t = this.findTouch(e);
    if (!t) return;
    const dx = t.clientX - this.startX;
    const dy = t.clientY - this.startY;
    if (dx * dx + dy * dy > SLOP_PX * SLOP_PX) this.moved = true;
  }

  handleEnd(e) {
    if (!this.findTouch(e)) return;
    const quick = this.now() - this.startTime < HOLD_MS;
    if (e.type === "touchend" && quick && !this.holding && !this.moved) {
      this.attackQueued = true;
    }
    this.touchId = null;
    this.moved = false;
    this.holding = false;
  }

  // True selama jari ditahan diam >= HOLD_MS (dan tetap true sampai jari diangkat)
  isMining() {
    if (!this.holding && this.touchId !== null && !this.moved &&
        this.now() - this.startTime >= HOLD_MS) {
      this.holding = true;
    }
    return this.holding;
  }

  // Progres cincin tahan 0..1, atau -1 bila tidak ada tahan diam yang sedang berlangsung
  holdProgress() {
    if (this.touchId === null || this.moved) return -1;
    const el = this.now() - this.startTime;
    if (el < RING_DELAY_MS) return -1;
    return Math.min(1, (el - RING_DELAY_MS) / (HOLD_MS - RING_DELAY_MS));
  }

  // True satu kali untuk setiap tap
  consumeAttack() {
    const a = this.attackQueued;
    this.attackQueued = false;
    return a;
  }

  dispose() {
    if (!this.canvas) return;
    this.canvas.removeEventListener("touchstart", this.onStart);
    this.canvas.removeEventListener("touchmove", this.onMove);
    this.canvas.removeEventListener("touchend", this.onEnd);
    this.canvas.removeEventListener("touchcancel", this.onEnd);
    this.canvas = null;
  }
}

return { TouchAction };
})();
const msrc_core_input_touch_ring_js = (() => {
const DEFAULT_SIZE = 72; // diameter cincin (px); tebal cincin = size / 12
const STEPS = 48;       // kuantisasi progres: DOM hanya disentuh saat langkah berubah

// Cincin sentuh ala Minecraft Bedrock: muncul di titik jari saat ditahan, terisi searah jarum jam
// sampai penuh (= mulai menghancurkan). Murni visual; progres < 0 menyembunyikannya.
class TouchRing {
  // opt (dari option.json touchCircle): { enabled, size }. enabled=false -> tidak ada elemen DOM
  constructor(opt = {}) {
    this.el = null;
    this.visible = false;
    this.step = -1;
    this.x = NaN;
    this.y = NaN;
    if (opt.enabled === false) return;
    const size = this.size = opt.size || DEFAULT_SIZE;
    const thick = Math.round(size / 12);
    const el = document.createElement("div");
    const mask = `radial-gradient(circle farthest-side, transparent ${size / 2 - thick - 1}px, #000 ${size / 2 - thick}px)`;
    el.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:${size}px;border-radius:50%;
      pointer-events:none;display:none;z-index:9000;will-change:transform;
      -webkit-mask:${mask};mask:${mask};`;
    document.body.appendChild(el);
    this.el = el;
  }

  update(progress, x, y) {
    if (!this.el) return;
    if (progress < 0) {
      if (this.visible) { this.el.style.display = "none"; this.visible = false; this.step = -1; }
      return;
    }
    if (!this.visible) { this.el.style.display = "block"; this.visible = true; }
    if (x !== this.x || y !== this.y) {
      this.x = x; this.y = y;
      this.el.style.transform = `translate(${x - this.size / 2}px,${y - this.size / 2}px)`;
    }
    const step = Math.min(STEPS, Math.round(progress * STEPS));
    if (step !== this.step) {
      this.step = step;
      const deg = (step / STEPS) * 360;
      this.el.style.background = step >= STEPS
        ? "rgba(255,255,255,0.95)"
        : `conic-gradient(rgba(255,255,255,0.95) ${deg}deg, rgba(255,255,255,0.28) 0)`;
    }
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }
}

return { TouchRing };
})();
const msrc_core_assets_js = (() => {

const IMG = {"assets/cape/cape.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAMAAACVQ462AAAAM1BMVEUAAACQVClTQS/IdDmKWkMAXKwnPE8rNT0lKy/1pzIPRHMAgbgeJSsbKjcLMFGsZSMaHiFcofeLAAAAAXRSTlMAQObYZgAAAKBJREFUeNrt0jFuw0AQA8Dh4eTA/39pnE4RxFTqT27jwWI7smI8aTRsLi/L8uQq8CCV8m3VIEIEVarWTSqn0UKdDNaNNkDaKFQsG0mddWpSTlDLBseJ9kDdzRtQVdC7eYMUGrjeurHvAPv+cn9II6lSTcJ1y/Kw9YDt11cK+LFqTpjHZAog1g1kI/GegTIVhLhlIkJ4q2JSuIT4+Pj4l/4AbJBA+xNGOyIAAAAASUVORK5CYII=","assets/control/down.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAxklEQVR4XrWV2w2DMAxF3Yohslu/K6VbZIzMQD/KKkgMkX7ACq2cPpQ4D5ngHAkkSHy4cRDA9XIDAHhJHug8fYWgtcYHHMZa6x1nPElJQ9dAIyqlmlI756I6n/hHqxShtZFYkqQVOYwx0W16naNb4m7iYitqyw3HSvOKiUsFIbU51VZwUzdtXk7OWQ1r8zg9pbDeY4STMoSVuIVITD8ke6C1SSuOyJNWOPfcE67KON79+D/xPC9icsT3eJoeYtJtWz+uXj/TN0ZQX9131OSPAAAAAElFTkSuQmCC","assets/control/down_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAxElEQVR4Xr2V3Q2DIBRGuY3DsIJJB2ECHuxGTED3aOIKbHMNNJrLP1LoeVTu8fOLAiAim8FipQAw1I6IAIwxJ9VaDwkuhHCex0gpdbkqKMaYruScc2/OJT7plVrC2ShxCimld1kplVxH8RKPZJo4W0X4+hR6L1dLNnFLj6U1xSpKg7UHVztOCWrS68+rQUUtUkvTd2xpFZ5Uq+jlP+JwI7lDOBt1/Is82iu0ft8JV2TbXu7+dYKs63OIfN8/X7E9TGeceQew/z49OFSiSgAAAABJRU5ErkJggg==","assets/control/fly.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAx0lEQVR4Xs2VzQ0CIRBGR7NF0JtnE+yCMqhhPbitbGIR42G3Bc2gEBYEBhYTXwIXMo+PnwCcTxcAgGfPRs7DRwhSSppgN1pr4zhS10vqu4YwohCiKTUibupMYkurlAhrN+IcSinTuLDEvpArL4q/iTjyrDhMWpM8KU5JuPLoullyy82NWYp77E/EEVaJucv3KSb+u1uRPDyiNa173SzhQ1JDWBsl3iOPDg/xURMuyzhezbhLPM/3bnK3x9N06yZd1+Xt+tVn+gL/R3TbcKnScQAAAABJRU5ErkJggg==","assets/control/fly_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAxklEQVR4XuWV3QkDIQyATekwrnDQQZzAh+tGTmD3KNwKbpNiiiX+a+s99QOfJB8xCQYQUZzB1UsBYKkdEQGEECS11i5JXClFnstKKXdRKTjOua8yl1JGcZRxoCXVWtOpkcZG4hpc2JJzuuKSaETeFHOBMYZOoCevilNpYFSeTUVJkMLlNbo15k/vPX+qeZ7/mIpq8zylJo00zjPcvFkicfqRzJDGZqX4RZ6Nm7WPmeSa7Pud7j8bZNtuS+TH8XyL/TI9Y+e9AHOLTlsDsWthAAAAAElFTkSuQmCC","assets/control/jump.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAuklEQVR4XmNIjc5kYGBg+E9NDDKTEWogQ0ZGBsgCisGMGTPAZjCBCGoZimwWC7oTJSQkyHL1ixcvUPSBXQwD5BoKAuh6UQymJiDa4IaGBjAmFhBlMLKBxBpO0GBsBhFjOF6D0V1KistxGozLEGINp1lQYGQQGCAUjoTkCbqYXDDEDUYvSEgB6HoxIo8Sw5EBOIxfvHhJiuPwglWrVoPl4S6+ePEK1QwHAbCLN2xYTzVD3717CzGLVpUpAEcXZdnxFRWYAAAAAElFTkSuQmCC","assets/control/jump_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAvUlEQVR4Xu3V3QnDIBDAca90GFcIdBAn8CHdyAnsHoWs4DZXvGLwK3qx5q1/yFPwl0MkAiKKK7p7FACm6ogIIIQg1Fo7ZXClFDm3mWhs0VbEOeeGJpdSJuto4tAo6svXJnArrTU93FhwDHLxLlyDOHgTjgFjDD2hHn4I52iIi3e3IoZq+FHFOeYurn0wrjvxaH94L9mK/EdypnxtcSp+wYtTYe3rzHDN1vVJ7/cbZFkeU/Bte39hf5leced9ANHRQS16ZUNuAAAAAElFTkSuQmCC","assets/control/left.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAwElEQVR4XrWVUQrDIAyGs9FDeLc9D+wtPIZn6B7WqxR2iOxhvcJGuk00gibWfmCh0HyGP2jhehkBAN49FzlPPyFYa2mD3XjvN8eZHr2ksWvgLRpjmrpGxKRu6/hPq5TgtYm4hnOu9klALNZIw/BqaKVENjwOl8bvpQ2LUZQKa4gz1nJYx6KMpbnGiKJoyVokJrRysVgrT8T8ItHAa7Ph7ZFnw0N8aporMk239Egvy6ObPFxC83zvJl3X19d11M/0AybzX9t//kcVAAAAAElFTkSuQmCC","assets/control/left_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAw0lEQVR4XrWV2w3DIAxFcdVhWCFSB2ECPtKNmIDuUSkrsI0rqFLxaIxNyPmLIp9crlAMiKiu4B6lADDVjogASqkk9d5PCW6MSZ7bTGnuSlXkhBCGkmuti7mUeKcntdYefrSeLcQUlPQfLLFUGmk6rqml+bNz7vCQZOKRpDusKkYgxdRRe3Q7jnJurzmsKkaSs8QRqZwtlspFYgmFuP6RSKhnm1txRt7cCu9fknAk6/pM738bZFkeU+Tb9v6K4zK9Yud9AHaPO8v4H9RSAAAAAElFTkSuQmCC","assets/control/perspective.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAj0lEQVQ4ja2UwQ2AIAxFPw0jOSAz6CB6JXEEDzqIzOBBSUyhgpR/g/6+fgLB4NYGnQYTIc65JkLsIw0kAfWQLU2q3U9ApWPGOveRZJIapIHEC9yQA+W82UQ1+kz0N827brmJx5bgfF+8NfX1lxokdXvZBAD7fjQDxnEC8Dqa96s+0bLMzYAQTgCAedbqj+0C145FqPpqBH0AAAAASUVORK5CYII=","assets/control/right.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAv0lEQVR4XrWVQQ7CIBBFR+MhuJtrE7wFx+AMdWGv0sRD4MJeQTNoCR0i8Ft4CV2UzON3oC1dzlcionfLwc7DT0haa15gN9Za7zjypZU0dp1kRKXUptTOuVWdT7ywVcrI2pU4hzEmOy+pFjOIHBIj8mTzYv4l5Pul9HDihW7iEt0SV/c4fvRSG8IrjVAjhcW1UkiMSBOx/JAgyNpk8/bIY/xxc+6JhMsyDDc/HxJP06OZPPR4HO/NpPP8+rp6/Uw/ruRf2yNqLEsAAAAASUVORK5CYII=","assets/control/right_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAwUlEQVR4XrWVwQ3DIAxFcdVhWCFSB2ECDslGTED3qJQV2MYVVIkMKBhT8o5BfnwsggER1R08oxQAptoREUAplaTe+ynBjTHJ85gppa7UCkoIYSi51jqrS4kPWlJrbXPDsjYTc3Byikgc6ZVXPaZcSeJ351zzgOLEB1zyYTHHsJhrRbPHtJgenZOef56EHqlY3CsViSVSkVhKdivKh0RCWVvdin/k1Vvh/VsSrsm6bmn9nCDL8poi3/fPTxyH6R0z7wsA/zvLo9w6uAAAAABJRU5ErkJggg==","assets/control/sneak.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACpSURBVHjaYkiNzmRgYGD4T02cGp3JwAjlMGRkZDBQA8yYMYOBgYGBgYmahiKbxYIuISEhQZaBL168QOEzUcNQbHqZGGgEWIhR1NDQgJePDdDMxQMTFLi8DBPHFyRM5BhMTDgzkRpxVI08ZIOIMZSsMCbWEhZyw3hwpGP0goSSQoiFkAKKXPzixUuqBcGqVatRXXzx4hXqh/GGDeupZuC7d28hDFpVpoABAL9OYV+izFUiAAAAAElFTkSuQmCC","assets/control/sneak_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADGSURBVEhLxZXtDYMgEIZ7nYYVTDqIE/DDbsQEdI8mrsA22PcKBrDlQ7F9Ej2U8Hhe+CBr7eUMWExEXe0vJxEiHrTWCIcZx5HjFbdeUuBdnHEoNsa4VhtCCNd6Z80Ze/ZKQTo2EvekSiyljK4a/pvxHrLib79eU5KsWCnlWltyfaBYik+CkhRU1TgU1UhBtPLSSV6qY/oRv/qw8rLiVkLxb6ZbuJG0ko7d7G49WEuh9YNf9GCa7hzXE2QYbgiHmecnx5POPEsLCFlWofWsYGUAAAAASUVORK5CYIIAAElFTkSuQmCCAAAAAElFTkSuQmCCnd8aY0jyr65+cLRujrL+fJOPAaJMN46HP07L/I9c3n9ESitLhsbMMowoH/3cozJTep8My+2KiwA8gRAju39mJaqaAEeXWxfxIbJZCwbFGkMgYDWx692ANTNbFaEbegDqusY5t5Rc2yvHCLx/nlERinw1OT3GyxoDMRmWr+w0pjpOimoCGftl0CmX/eBQEYzowsBjm873/ZmqqubYiCxTv1kLyNz4Mbw+htmcKGzvMo6fcVI1mdK2LSFAvrJzL2Pgv1Pq7TgxaWEkpuHSkvyi4nw+471Py+E6UwnUYUTZrJOTY7CNKLkJ+BhQETbrq7WVZdR1fZvDfnBzHi9OXme0yIvbVXOZ5bZtbwHHOR5dve4ZQNd3vP+I028AJKKaoDKA7XbL4+Pj999t46qqcM5N6+54PHJ/f0/XdYQQZsCu6zgcDpNTY9CtTSY55xabelwmRVHw+vq6eKj87ZfU/8fHSrLxG7/VAAAAAElFTkSuQmCC","assets/control/sprint.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAxElEQVR4XrWV0Q3CIBCGT+MQ7OazCW7BGMxQH+wqTRzifLAraA6lgcNe6ZV+CW36cB9/D2jhcr4CALxbDnIefkKw1tIEm/HeB8eRLq2kqevEIxpjVKkRMasLiSNaKcFrM3FLRLFzLowIf5ZYFBNRzu9qsSRN3+QfVT2eSyzJq8QaqsS7JNZIpyM9h1ZKFEc6hS/O0k5IqeqxhkzMPyRr4LVFK7bIi1YgPteEE+m6W754w/BoJp+2W9/fm0nH8fV17fUz/QD5oHfZQNB0XQAAAABJRU5ErkJggg==","assets/control/sprint_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAw0lEQVR4Xr2VwQ3DIAwAcdVhWCFSB2ECHulGTED3qJQV2MYVTqiI05rEJT2JB0I+2U7AgIjmDK5ZCgBd7YgIYIwhaYyxS+LOOfJcekprF7WiJqWkytxau4qjjAtaaYbHrsQc7z2tAt9LiOIQAsUWOd+rxRmtXMy4oJHvEmvYJf7W41LJJ5pijTTT/N2kDyixuXk1vFSpdE6zFVr+I+YPyRF47KbHv8hrlvf4cSQ5kXG80/l7ggzDrYt8mp6zOA/TM2beC4H5Uy28uRRJAAAAAElFTkSuQmCC","assets/control/up.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAwUlEQVR4XrWVwQ3CMAxFDWKI7MYZKWyRMTJDOdBVKjFEONAVQDYUJWnruKnzpOSS+vnXqhq4nK8AAG/Nhc7DTwjWWmywG+89OY64aUlj1ymPaIypSh1CSOoo8UStFMlrE7EmYrFzjpYUkTgWSuVF8ZJIImfFnKAkXxWXChHumdl3PMHNVdK0OONamolXRxEjefWcZokTcf4j2UJeOxvFHnkMJQ7huSUcS9fd6PyfeBgeanKEEvf9XU06jq+vq9Vl+gHTU1/brfavdgAAAABJRU5ErkJggg==","assets/control/up_pressed.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAv0lEQVR4Xr2V4QnDIBBGvdJhXCHQQZzAH+lGTmD3KGQFt7nitQkXU09jtQ8CAb3H5yEeIKIawTVKAaCrHREBlFIk9d53CW6MIc+lp5S7qBWcEEJTcq31ro4Sr7RKI2ntTixhraWvlioxF9bKi+Jvohq5KJYEJXlWXCqMSHsO123FObf9pwK+lqPY41aGibOt4NQcPWVY4v+I04fkDGntoce/yDmf9/hxJpzIPN9pfZsg03TrIl+W51sch+mImfcC8745W/SuFPcAAAAASUVORK5CYII=","assets/skins/steve.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAYFBMVEUAAAC/qpW9qJm/o5wGBAYHBQcIBggIBwgJCAkKBwsKCQoMCQwOCw4ODA8PDQ8PDhAQDhARDxESERIUFBQVFRUkJCMwMDA9PT14d3icl5yjnaSnoKevr6+3sLi/vb/g4OA7H+BoAAAABHRSTlMADCMkOCMMTgAAAyNJREFUWMOlVgubmyAQpK05QY8YaL001sj//5dll11e0URz890D0B2WBcYRgnCtII7iOiKu/P84wTXEf4OA8DbBqyW8Ks1I2CIg5uv7BONego1tfL60ODE2Hs9DMTSuEozjH0RKIhQ0EcTXxzp1InA5AWWyhyBl4MoM6iXsyuB3lsFegrwGzrnjGWwWsdzO7WtaXoEqeu+11lora636+esH9XsPGEVofs8Yo1dJ4VXtCWK/v83zDRgC9hA0BcFt/vqab8cI7BrBniXQJE3TwKuECQgm6iCHNgFhyDdExuohG2TwjwbANM3zNGFzCCHDJoEEdF2D6DoZohbnlqGABSQCWxB0sj0hWtnRfM6ZfO4hLMHaHuGpEkHro6T/C/BcWDYgsEMoIcxtBmXOZyAIYzlBWyHUXTs3MAFmoi5aXy7GhDFjLimDjw9YBWcgiUC6uIkaVq7On5/ncyI9R4LudOo8AoFv9HSKdTjP3FZD30Mtw5hvpCU0DYRSEds2FC7tX+yEU8JZ6aKI0piwjX4JVHlp6l0IZ4lrkIqI+8vM2ExBeXv5uyzL/f4Pcb8viUBroCgJYqKp/VonrBXfQKkHHvN8kECUBDP+HIjX1RLeIRDqPYJwzbGZ9CDUgPQAZ2A9iEGVHsSDTXognBOsBDBOepBmtc8kvtQDGs7mR4pSD9KDjp+7vccCb2HWxXMnqCZZG/UgvXfZJNwi2AxAPXhYgtD1e6gHWbfSg7SgvHBFO1yu+KTWg7ipYRdwEp23SQ8ezwEeYSCE1fo2BZma4PU9IIL3kQUrMgxxDp/yU7MB318foCsCvZtAVATNcYJSD5pDS1CsB3z8vLxHb6IVf875874az6oAnzCF34fUXyVI/aQDrAvsE9g3sB9gf5B/Tmx+nhjsE9g3sB9gf/AoZJwC6QL7BPYN7AfYHzyVhXbLL3g/wP6A9aDSh4oJ8iffwH6A/cGmLLAusE9g38B+gP0B60GlDz6IdIF9AvuG+Jmlv1Epcn3wNZWoC5K2MfZlw36A/UHcg6gPcI35KPtfmtESFPuBBQyC9wdrKppEhQmC6UCCV77gPwHfgQ4PmTx9AAAAAElFTkSuQmCC","assets/sky/clouds.png":"data:image/png;base64,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","assets/sky/sun.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAhFBMVEX//9n//6r/1UooKBAnJw8mJg8kJA4jIw4iIg4gIA0fHwweHgwcHAsbGwsbGwoaGgoZGQoYGAkXFwkWFggVFQgUFAgTEwcSEgcREQcQEAYODgUNDQUMDAQLCwQKCgQKCgMJCQMICAMHBwIGBgIGBgEFBQEEBAEDAwEDAwACAgABAQAAAAAM8pN8AAABAUlEQVR42o2TW27EMAhFeThdzMz+N1f7cmtwppH6Q5EtRTrHkMSgb/kE5Ql9nt4P4x+uH4EFQzRubhQrrCWwsAZDJRILTY1W+AhMzGAqklhz0bSE4gjGXpSMjW0vL6MEgkBlEIpKZXBX1yMwiECcHCJyzpubb68EAisqECrcqGK4awlgLCApQIqqezruw7LKSxBYCTNNCXk4pbG36IucmQGYgVtwu9wzw6W6BcRKZS1MOXH5GImH+RG+FzD3Botrnr72/rqFhYk5gaogVcP9unwn+hXWWhPgLejmY4z/CG2J/iX7z+x+VP+ru8tqr7ttmL7l2qbt2r4dnH70+uHtxv8HQiZthMX71jEAAAAASUVORK5CYII=","assets/textures/block/dirt/dirt.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAADRSURBVDjLdZKxDUIxDES9Disg0VHRI4HECClpGAD9DdiF6UAX6aL37+cXVhLbOfvOru/78fu0S7fX9dht5rufDqu4z9JFiUzQe1mW4TMg74rJymiuwjerMYd5JbTW2nCwm6SSXQwABxXQZ3InoAqlr9xWVnKr1Ib3IWJylHhMoOKk6bMyOcfnbmb+DpBOnm45PzM23YPknrxJpXI85Gxg+0nFWtWMFytodKTAMfdNTGeC7Jm7WlGQPW/njXCmMdvQyiQqTP5ZaAOQO2CR9ubvAn/2hSirp9qLQAAAAABJRU5ErkJggg==","assets/textures/block/grass_block/carried.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACC0lEQVQ4Tz2TVU9DQRCF96cAFaDUsEBCgru7By0t7k5wlwcCCQ8k/NZhv0MuD7e93Z2ZI3Pqeo9ilvuptt7DmLWtR/V07xVbUzZsnTtFNnyZsL6TEuvYKrK2jULr2Cy08Ye01UzmWZe/d33HJSocuU5avy8cOItbcy6i75aViAZNPKVt/D4tEMCoZ1jnth8wepvSpMZM2FpXo0Jo95fd+8V6YDh8lbSJx7RNv5apsW6uQCBzHxXmamcLrHUtKoow6DmICZ2BvMOgZSUqEO6RBzIyqHGjN0kVMJ3vqZdSm34rEwveF74qrXYmX4g0TT2XWtNSWPfyALT+07jVe1robF6OyDS8GTyPizLvNABAnZp3/+Q5pg2dJ2zsPiXN0KYQSdDHF4agF0bcwySQ4/igYOgiIW0MacyEbOwupWYKA/NgRz0bC7bjmAZVECa9PlAopAlms+/lOmeloGM46yQfsHcgcDn/WSFT2DGe0IRxINPIAyLaGQoTgBzoTGMQPjAMNjLJI2W/q6x+PiTdeEMjJv57gE5p9BEmVFxwBiKhCrIBs4bFkNDRTwYw2rFniqDDAWsNtDYshHSmYVt/aSWVMIUVfY5GYkoiKaRI/wd/Tu5xHCnUIJffSFC0feD0X+AQrQFF0kZIaMRpgsSDoRgZrBwWDqokj6loZv9sIRiAmUt+ONmgGX/ICvWY/wvwT+3Zk5nu/AAAAABJRU5ErkJggg==","assets/textures/block/grass_block/side.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB3UlEQVR4XnVSSyuEYRg93/SZmplcZ8FMM5NLKTaEhZQSGyllgVIWFhYW/oCdjX8gUchOI8plQyJlQzFjNpRyKWloZpDmUhp9Og/P9DXl1FvP5Tz31wiHw1Y8HofT6UQ2m0UwGAR1n8+HVCoFwuVywe12i9/r9SIajSIUCiGXy8FBQj6fF4dpmkI+31qSwGQyiUAgIEQinU6L7PF4JGEmk4GDVS53ViRQCQS7uDlclwD6yPP7/dien0UikRA9srsKY6y7yfK29CEVO5LAzuEpnG0uikw09o7i9ngDHUOTuNheRm1NJR5f3sVH2ViYHrCeXj8QrK5Ag68Ka/uX6G6pA22EkgkWKn2NCPc09iAJTBJJovEu/ibG4sCCLXaE0ppKSU5bT2s9jIO5cevk6r7QclnbID4je6KTQNBvl1lMuzY1WAl3z6co/yPQRzI7ZHcKDSYcJGgVknR2HYM6d0LYfdwBddmBLkVBp265OLB4FPlISqaTjwua6G8vtK92HYWdclcsXjgjoePwnDr/NerRjN8l68X0zExozIx0WRTUWJzkP+goMoL949wnv6QS29RkLMAA/VSU6eeTK2hrdJR8Z4VIG5dJG/fBkfQa9n9jaosk2atySbWRvX/vr0V/ADWXPbAdu8FyAAAAAElFTkSuQmCC","assets/textures/block/grass_block/side_overlay.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAApUlEQVR4Xu2OvQ2GIBCGXwwxUUsqjbqWa1hICxNYOIbTMAaF2Kk0Jpq75Es+d+CpeH/uDrGu6+O9R57nuK4LXdeBdF3X2PcdRFEUKMuSc6UUnHPo+x4xRmRUuO+bAykll8dxFOSHENC2LReJ4zj4XVUVLzzPExldmaZJ0OCvQNAvjDGCBiijXtM0GIZBbNvGWmvNhz4sy/L8G9Za1vM8f/xEIvHlBe/NT0/ttsQ2AAAAAElFTkSuQmCC","assets/textures/block/grass_block/top.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB90lEQVQ4Tz2Tx87qUAyEzyOz+em9915F750NAiQ2IPFgvvpGyl2EJCe2p3hw3W7Xfr+fdTody+fzuhqNhiUSCatWqzabzazf71u5XLZCoWClUsn2+735fD6r1Wrmer2eCheLhQ0GAxuNRpZMJnVPp9MadDwebbfbCQQw6hlWqVTMrddrTYrFYpbNZoVQLBat2WzqguF8PrfD4WDX61WNgUBAIM/n05zf77dcLieKMGi1WkJnYLvdFoNMJiMQviMPZGRQ41arlQqYzv1yudjtdhMLnt/vt/39/QmRpvP5bPF4XN/lAWjD4dCCwaB0plIpmYY34/FYlHmmAQDqeK7X65LnmDaZTGy73UoztClEEvTxhSGPx0OMkAgTT47jh4LpdCptDIlGo7bZbNRMoWce7KhnY952HNOgiqOn00koFNIEs/v9rnNWCjsMZ53kA/YOBD6+Xi+Zwo7xhCaMAxnaNIOIdobCBCAHOtMYhA8Mgw2FIH2/XwuFQtKNNzRi4n8P0AldIkyo+MAZiISKd55hFolEhI5+MoDRjj1TBB0OWCuU0RoOh3XGO3eaSCVMYUWfo5GYkkiQKGII5+R+uVxKCjXIZQNI4J3A6b9AEVo9iqSNkNCI0wSJC0Mx0ls5LBxUSR5T0cz+2YI3ADM/n4+yQTP+kBXqMf8fm1m5bLd5CjIAAAAASUVORK5CYII=","assets/textures/colormap/birch.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABGdBTUEAALGPC/xhBQAAAv1JREFUeF7t1EEBACAMACFLro9tjDmDHA8qcO6bBZoEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwBkzX5wgSU2cnKyyQAAAABJRU5ErkJggg==","assets/textures/colormap/dry_foliage.png":"data:image/png;base64,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","assets/textures/colormap/evergreen.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABGdBTUEAALGPC/xhBQAAAvxJREFUeF7t1EEBADAIAKFVNdbSapDjQQXe/FmgSQAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQJgAIEwAECYACBMAhAkAwgQAYQKAMAFAmAAgTAAQJgAIEwCECQDCBABhAoAwAUCYACBMABAmAAgTAIQJAMIEAGECgDABQNbsAbtsI0eb1gjdAAAAAElFTkSuQmCC","assets/textures/colormap/foliage.png":"data:image/png;base64,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","assets/textures/colormap/grass.png":"data:image/png;base64,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","assets/textures/colormap/mangrove_swamp_foliage.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TRZEWC3YQEcxQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vMKPEIIYQUhipp5IL2bgOb7u4ePrXZRneZ/7cwSVvMkAn0g8x3TDIt4gntm0dM77xGFWkhTic+Jxgy5I/Mh12eU3zkWHBZ4ZNjKpeeIwsVjsYLmDWclQiaeJI4qqUb6QdVnhvMVZrdRY6578hYG8tpLmOs1hxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4hx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSIAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQI6N8GLq7bmrwHXO4Ag0+6ZEiO5KcpFArA+xl9Uw4YuAX61tzeWvs4fQAy1NXyDXBwCIwVKXvd4929nb39e6bV3w9Uu3KbCAyaQgAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+YDEA0gAx8lmTsAAAJfSURBVHja7dRBAQAgCMBAsYxpDUNCKEAD7iLssfj56gArXQnAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMABg0iqIBGQkeS30AAAAAElFTkSuQmCC","assets/textures/colormap/swamp_foliage.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJoSURBVHja7NQhAQAACMAwalEJRX8DBWjAxApcPKpzgJ9CBDAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMAAxABDAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMAAxABDAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMAAxACDAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwAMADAAAADAAwADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAwAMAAAAMADAAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMADAAwAAAAwAMALgsAAAA//8DACGBHw9dmaKeAAAAAElFTkSuQmCC","assets/textures/colormap/swamp_grass.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAOvSURBVHja7NQxEQAgDACx2uodElDC1An7xQAOmuElfGLf1ZrdqdTQwgAyAgAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAAIABAGAEAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAAAAMAwAgAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAQAAJgCAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAIAAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAAgAAoAAIAAIAAKAACAACAACgAAgAMgIABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAPTrAQAA//8DAGkwiWrR5eKCAAAAAElFTkSuQmCC"};
const TXT = {"assets/biome/biomes_client.json":"{\"biomes\":{\"default\":{\"water_surface_color\":\"#44AFF5\",\"water_surface_transparency\":0.65,\"fog_identifier\":\"minecraft:fog_default\",\"remove_all_prior_fog\":false,\"inherit_from_prior_fog\":false},\"minecraft:plains\":{\"water_surface_color\":\"#44AFF5\",\"fog_identifier\":\"minecraft:fog_plains\",\"inherit_from_prior_fog\":false},\"minecraft:sunflower_plains\":{\"water_surface_color\":\"#44AFF5\",\"fog_identifier\":\"minecraft:fog_sunflower_plains\",\"inherit_from_prior_fog\":false},\"minecraft:desert\":{\"water_surface_color\":\"#32A598\",\"fog_identifier\":\"minecraft:fog_desert\",\"inherit_from_prior_fog\":false},\"minecraft:extreme_hills\":{\"water_surface_color\":\"#007BF7\",\"fog_identifier\":\"minecraft:fog_extreme_hills\",\"inherit_from_prior_fog\":false},\"minecraft:forest\":{\"water_surface_color\":\"#1E97F2\",\"fog_identifier\":\"minecraft:fog_forest\",\"inherit_from_prior_fog\":false},\"minecraft:flower_forest\":{\"water_surface_color\":\"#20A3CC\",\"fog_identifier\":\"minecraft:fog_flower_forest\",\"inherit_from_prior_fog\":false},\"minecraft:taiga\":{\"water_surface_color\":\"#287082\",\"fog_identifier\":\"minecraft:fog_taiga\",\"inherit_from_prior_fog\":false},\"minecraft:taiga_mutated\":{\"water_surface_color\":\"#1E6B82\",\"fog_identifier\":\"minecraft:fog_taiga_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:swampland\":{\"water_surface_color\":\"#4c6559\",\"water_surface_transparency\":1,\"fog_identifier\":\"minecraft:fog_swampland\",\"inherit_from_prior_fog\":false},\"minecraft:swampland_mutated\":{\"water_surface_color\":\"#4c6156\",\"water_surface_transparency\":1,\"fog_identifier\":\"minecraft:fog_swampland_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:mangrove_swamp\":{\"water_surface_color\":\"#3a7a6a\",\"fog_identifier\":\"minecraft:fog_mangrove_swamp\",\"inherit_from_prior_fog\":false},\"minecraft:river\":{\"water_surface_color\":\"#0084FF\",\"fog_identifier\":\"minecraft:fog_river\",\"inherit_from_prior_fog\":false},\"minecraft:hell\":{\"water_surface_color\":\"#905957\",\"fog_identifier\":\"minecraft:fog_hell\",\"inherit_from_prior_fog\":false},\"minecraft:the_end\":{\"water_surface_color\":\"#62529e\",\"fog_identifier\":\"minecraft:fog_the_end\",\"inherit_from_prior_fog\":false},\"minecraft:frozen_river\":{\"water_surface_color\":\"#185390\",\"fog_identifier\":\"minecraft:fog_frozen_river\",\"inherit_from_prior_fog\":false},\"minecraft:ice_plains\":{\"water_surface_color\":\"#14559b\",\"fog_identifier\":\"minecraft:fog_ice_plains\",\"inherit_from_prior_fog\":false},\"minecraft:ice_plains_spikes\":{\"water_surface_color\":\"#14559b\",\"fog_identifier\":\"minecraft:fog_ice_plains_spikes\",\"inherit_from_prior_fog\":false},\"minecraft:ice_mountains\":{\"water_surface_color\":\"#1156a7\",\"fog_identifier\":\"minecraft:fog_ice_mountains\",\"inherit_from_prior_fog\":false},\"minecraft:mushroom_island\":{\"water_surface_color\":\"#8a8997\",\"fog_identifier\":\"minecraft:fog_mushroom_island\",\"inherit_from_prior_fog\":false},\"minecraft:mushroom_island_shore\":{\"water_surface_color\":\"#818193\",\"fog_identifier\":\"minecraft:fog_mushroom_island_shore\",\"inherit_from_prior_fog\":false},\"minecraft:beach\":{\"water_surface_color\":\"#157cab\",\"fog_identifier\":\"minecraft:fog_beach\",\"inherit_from_prior_fog\":false},\"minecraft:desert_hills\":{\"water_surface_color\":\"#1a7aa1\",\"fog_identifier\":\"minecraft:fog_desert_hills\",\"inherit_from_prior_fog\":false},\"minecraft:forest_hills\":{\"water_surface_color\":\"#056bd1\",\"fog_identifier\":\"minecraft:fog_forest_hills\",\"inherit_from_prior_fog\":false},\"minecraft:taiga_hills\":{\"water_surface_color\":\"#236583\",\"fog_identifier\":\"minecraft:fog_taiga_hills\",\"inherit_from_prior_fog\":false},\"minecraft:extreme_hills_edge\":{\"water_surface_color\":\"#045cd5\",\"fog_identifier\":\"minecraft:fog_extreme_hills_edge\",\"inherit_from_prior_fog\":false},\"minecraft:jungle\":{\"water_surface_color\":\"#14A2C5\",\"fog_identifier\":\"minecraft:fog_jungle\",\"inherit_from_prior_fog\":false},\"minecraft:bamboo_jungle\":{\"water_surface_color\":\"#14A2C5\",\"fog_identifier\":\"minecraft:fog_bamboo_jungle\",\"inherit_from_prior_fog\":false},\"minecraft:jungle_mutated\":{\"water_surface_color\":\"#1B9ED8\",\"fog_identifier\":\"minecraft:fog_jungle_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:jungle_hills\":{\"water_surface_color\":\"#1B9ED8\",\"fog_identifier\":\"minecraft:fog_jungle_hills\",\"inherit_from_prior_fog\":false},\"minecraft:bamboo_jungle_hills\":{\"water_surface_color\":\"#1B9ED8\",\"fog_identifier\":\"minecraft:fog_bamboo_jungle_hills\",\"inherit_from_prior_fog\":false},\"minecraft:jungle_edge\":{\"water_surface_color\":\"#0D8AE3\",\"fog_identifier\":\"minecraft:fog_jungle_edge\",\"inherit_from_prior_fog\":false},\"minecraft:stone_beach\":{\"water_surface_color\":\"#0d67bb\",\"fog_identifier\":\"minecraft:fog_stone_beach\",\"inherit_from_prior_fog\":false},\"minecraft:cold_beach\":{\"water_surface_color\":\"#1463a5\",\"fog_identifier\":\"minecraft:fog_cold_beach\",\"inherit_from_prior_fog\":false},\"minecraft:birch_forest\":{\"water_surface_color\":\"#0677ce\",\"fog_identifier\":\"minecraft:fog_birch_forest\",\"inherit_from_prior_fog\":false},\"minecraft:birch_forest_hills\":{\"water_surface_color\":\"#0a74c4\",\"fog_identifier\":\"minecraft:fog_birch_forest_hills\",\"inherit_from_prior_fog\":false},\"minecraft:roofed_forest\":{\"water_surface_color\":\"#3B6CD1\",\"fog_identifier\":\"minecraft:fog_roofed_forest\",\"inherit_from_prior_fog\":false},\"minecraft:cold_taiga\":{\"water_surface_color\":\"#205e83\",\"fog_identifier\":\"minecraft:fog_cold_taiga\",\"inherit_from_prior_fog\":false},\"minecraft:cold_taiga_mutated\":{\"water_surface_color\":\"#205e83\",\"fog_identifier\":\"minecraft:fog_cold_taiga_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:cold_taiga_hills\":{\"water_surface_color\":\"#245b78\",\"fog_identifier\":\"minecraft:fog_cold_taiga_hills\",\"inherit_from_prior_fog\":false},\"minecraft:mega_taiga\":{\"water_surface_color\":\"#2d6d77\",\"fog_identifier\":\"minecraft:fog_mega_taiga\",\"inherit_from_prior_fog\":false},\"minecraft:mega_spruce_taiga\":{\"water_surface_color\":\"#2d6d77\",\"fog_identifier\":\"minecraft:fog_mega_spruce_taiga\",\"inherit_from_prior_fog\":false},\"minecraft:mega_taiga_mutated\":{\"water_surface_color\":\"#2d6d77\",\"fog_identifier\":\"minecraft:fog_mega_taiga_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:mega_spruce_taiga_mutated\":{\"water_surface_color\":\"#2d6d77\",\"fog_identifier\":\"minecraft:fog_mega_spruce_taiga_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:mega_taiga_hills\":{\"water_surface_color\":\"#286378\",\"fog_identifier\":\"minecraft:fog_mega_taiga_hills\",\"inherit_from_prior_fog\":false},\"minecraft:extreme_hills_plus_trees\":{\"water_surface_color\":\"#0E63AB\",\"fog_identifier\":\"minecraft:fog_extreme_hills_plus_trees\",\"inherit_from_prior_fog\":false},\"minecraft:extreme_hills_plus_trees_mutated\":{\"water_surface_color\":\"#0E63AB\",\"fog_identifier\":\"minecraft:fog_extreme_hills_plus_trees_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:extreme_hills_mutated\":{\"water_surface_color\":\"#0E63AB\",\"fog_identifier\":\"minecraft:fog_extreme_hills_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:savanna\":{\"water_surface_color\":\"#2C8B9C\",\"fog_identifier\":\"minecraft:fog_savanna\",\"inherit_from_prior_fog\":false},\"minecraft:savanna_plateau\":{\"water_surface_color\":\"#2590A8\",\"fog_identifier\":\"minecraft:fog_savanna_plateau\",\"inherit_from_prior_fog\":false},\"minecraft:savanna_mutated\":{\"water_surface_color\":\"#2590A8\",\"fog_identifier\":\"minecraft:fog_savanna_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:mesa\":{\"water_surface_color\":\"#4E7F81\",\"fog_identifier\":\"minecraft:fog_mesa\",\"inherit_from_prior_fog\":false},\"minecraft:mesa_bryce\":{\"water_surface_color\":\"#497F99\",\"fog_identifier\":\"minecraft:fog_mesa_bryce\",\"inherit_from_prior_fog\":false},\"minecraft:mesa_mutated\":{\"water_surface_color\":\"#497F99\",\"fog_identifier\":\"minecraft:fog_mesa_mutated\",\"inherit_from_prior_fog\":false},\"minecraft:mesa_plateau_stone\":{\"water_surface_color\":\"#55809E\",\"fog_identifier\":\"minecraft:fog_mesa_plateau_stone\",\"inherit_from_prior_fog\":false},\"minecraft:mesa_plateau\":{\"water_surface_color\":\"#55809E\",\"fog_identifier\":\"minecraft:fog_mesa_plateau\",\"inherit_from_prior_fog\":false},\"minecraft:ocean\":{\"water_surface_color\":\"#1787D4\",\"fog_identifier\":\"minecraft:fog_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:deep_ocean\":{\"water_surface_color\":\"#1787D4\",\"fog_identifier\":\"minecraft:fog_deep_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:warm_ocean\":{\"water_surface_color\":\"#02B0E5\",\"water_surface_transparency\":0.55,\"fog_identifier\":\"minecraft:fog_warm_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:deep_warm_ocean\":{\"water_surface_color\":\"#02B0E5\",\"fog_identifier\":\"minecraft:fog_deep_warm_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:lukewarm_ocean\":{\"water_surface_color\":\"#0D96DB\",\"fog_identifier\":\"minecraft:fog_lukewarm_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:deep_lukewarm_ocean\":{\"water_surface_color\":\"#0D96DB\",\"fog_identifier\":\"minecraft:fog_deep_lukewarm_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:cold_ocean\":{\"water_surface_color\":\"#2080C9\",\"fog_identifier\":\"minecraft:fog_cold_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:deep_cold_ocean\":{\"water_surface_color\":\"#2080C9\",\"fog_identifier\":\"minecraft:fog_deep_cold_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:frozen_ocean\":{\"water_surface_color\":\"#2570B5\",\"fog_identifier\":\"minecraft:fog_frozen_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:deep_frozen_ocean\":{\"water_surface_color\":\"#2570B5\",\"fog_identifier\":\"minecraft:fog_deep_frozen_ocean\",\"inherit_from_prior_fog\":false},\"minecraft:warped_forest\":{\"water_surface_color\":\"#905957\",\"fog_identifier\":\"minecraft:fog_warped_forest\",\"inherit_from_prior_fog\":false},\"minecraft:crimson_forest\":{\"water_surface_color\":\"#905957\",\"fog_identifier\":\"minecraft:fog_crimson_forest\",\"inherit_from_prior_fog\":false},\"minecraft:soulsand_valley\":{\"water_surface_color\":\"#905957\",\"fog_identifier\":\"minecraft:fog_soulsand_valley\",\"inherit_from_prior_fog\":false},\"minecraft:basalt_deltas\":{\"water_surface_color\":\"#3f76e4\",\"fog_identifier\":\"minecraft:fog_basalt_deltas\",\"inherit_from_prior_fog\":false},\"minecraft:cherry_grove\":{\"water_surface_color\":\"#5db7ef\",\"fog_identifier\":\"minecraft:fog_cherry_grove\",\"inherit_from_prior_fog\":false}}}","assets/biome/plains.client_biome.json":"{\"client_biome\":{\"description\":{\"identifier\":\"minecraft:plains\"},\"components\":{\"fog\":\"fog_plains\",\"water\":\"#44AFF5\",\"climate\":{\"temperature\":0.8,\"downfall\":0.4},\"atmosphere_identifier\":\"default_atmospherics\",\"color_grading\":\"default_color_grading\",\"lighting\":\"default_lighting\",\"water_identifier\":\"default_water\"}}}","assets/block/index.json":"{\"blocks\":[\"nature/dirt.json\",\"nature/grass_block.json\"]}","assets/block/nature/dirt.json":"{\"identifier\":\"minecraft:dirt\",\"components\":{\"displayname\":\"Dirt\",\"category\":\"nature\",\"textures\":{\"*\":\"block/dirt/dirt\"},\"loot\":[\"minecraft:dirt\"]}}","assets/block/nature/grass_block.json":"{\"identifier\":\"minecraft:grass_block\",\"components\":{\"displayname\":\"Grass Block\",\"category\":\"nature\",\"geometry\":\"full_block\",\"textures\":{\"render_method\":\"opaque\",\"top\":{\"texture\":\"block/grass_block/top\",\"tint\":\"biome\"},\"side\":{\"texture\":\"block/grass_block/side\",\"overlay\":\"block/grass_block/side_overlay\",\"tint\":\"biome\"},\"bottom\":\"block/dirt/dirt\",\"carried\":{\"texture\":\"block/grass_block/carried\",\"overlay_color\":\"#79c05a\"}},\"loot\":[\"minecraft:dirt\"],\"transforplacetop\":{\"to\":\"minecraft:dirt\",\"tick\":10}}}","assets/fog/fog_plains.json":"{\"fog_settings\":{\"description\":{\"identifier\":\"minecraft:fog_plains\"},\"distance\":{\"air\":{\"fog_start\":0.92,\"fog_end\":1,\"fog_color\":\"#C0D8FF\",\"render_distance_type\":\"render\"},\"water\":{\"fog_start\":0,\"fog_end\":60,\"fog_color\":\"#44AFF5\",\"render_distance_type\":\"fixed\",\"transition_fog\":{\"init_fog\":{\"fog_start\":0,\"fog_end\":0.01,\"fog_color\":\"#44AFF5\",\"render_distance_type\":\"fixed\"},\"min_percent\":0.25,\"mid_seconds\":5,\"mid_percent\":0.6,\"max_seconds\":30}}}}}","assets/models/block/full_block.geo.json":"{\"format_version\":\"1.12.0\",\"minecraft:geometry\":[{\"description\":{\"identifier\":\"geometry.full_block\",\"texture_width\":16,\"texture_height\":16},\"bones\":[{\"name\":\"block\",\"pivot\":[0,0,0],\"cubes\":[{\"origin\":[-8,0,-8],\"size\":[16,16,16]}]}]}]}","assets/models/entity/player/wide.geo.json":"{\"format_version\":\"1.12.0\",\"minecraft:geometry\":[{\"description\":{\"identifier\":\"geometry.wide\",\"texture_width\":64,\"texture_height\":64,\"visible_bounds_width\":3,\"visible_bounds_height\":3.5,\"visible_bounds_offset\":[0,1.25,0]},\"bones\":[{\"name\":\"Waist\",\"pivot\":[0,12,0]},{\"name\":\"Head\",\"parent\":\"Waist\",\"pivot\":[0,24,0],\"cubes\":[{\"origin\":[-4,24,-4],\"size\":[8,8,8],\"uv\":[0,0]},{\"origin\":[-4,24,-4],\"size\":[8,8,8],\"inflate\":0.5,\"uv\":[32,0]}]},{\"name\":\"Body\",\"parent\":\"Waist\",\"pivot\":[0,24,0],\"cubes\":[{\"origin\":[-4,12,-2],\"size\":[8,12,4],\"uv\":[16,16]},{\"origin\":[-4,12,-2],\"size\":[8,12,4],\"inflate\":0.25,\"uv\":[16,32]}]},{\"name\":\"Right Arm\",\"parent\":\"Waist\",\"pivot\":[-5,22,0],\"cubes\":[{\"origin\":[-8,12,-2],\"size\":[4,12,4],\"uv\":[40,16]},{\"origin\":[-8,12,-2],\"size\":[4,12,4],\"inflate\":0.25,\"uv\":[40,32]}]},{\"name\":\"Left Arm\",\"parent\":\"Waist\",\"pivot\":[5,22,0],\"cubes\":[{\"origin\":[4,12,-2],\"size\":[4,12,4],\"uv\":[32,48]},{\"origin\":[4,12,-2],\"size\":[4,12,4],\"inflate\":0.25,\"uv\":[48,48]}]},{\"name\":\"Right Leg\",\"pivot\":[-1.9,12,0],\"cubes\":[{\"origin\":[-3.9,0,-2],\"size\":[4,12,4],\"uv\":[0,16]},{\"origin\":[-3.9,0,-2],\"size\":[4,12,4],\"inflate\":0.25,\"uv\":[0,32]}]},{\"name\":\"Left Leg\",\"pivot\":[1.9,12,0],\"cubes\":[{\"origin\":[-0.1,0,-2],\"size\":[4,12,4],\"uv\":[16,48]},{\"origin\":[-0.1,0,-2],\"size\":[4,12,4],\"inflate\":0.25,\"uv\":[0,48]}]}]}]}","assets/particles/block_destruct.json":"{\"format_version\":\"1.26.10\",\"particle_effect\":{\"description\":{\"identifier\":\"minecraft:block_destruct\",\"basic_render_parameters\":{\"material\":\"particles_alpha\",\"texture\":\"atlas.terrain\"}},\"components\":{\"minecraft:emitter_lifetime_once\":{},\"minecraft:emitter_rate_instant\":{\"num_particles\":\"variable.emitter_particles_count\"},\"minecraft:emitter_shape_point\":{\"offset\":[\"Math.random(-variable.emitter_radius, variable.emitter_radius)\",\"Math.random(-variable.emitter_radius, variable.emitter_radius)\",\"Math.random(-variable.emitter_radius, variable.emitter_radius)\"],\"direction\":[\"Math.random(-1,1)\",1,\"Math.random(-1, 1)\"]},\"minecraft:particle_appearance_billboard\":{\"size\":[\"variable.particle_random_1 * 0.0375 + 0.0375\",\"variable.particle_random_1 * 0.0375 + 0.0375\"],\"facing_camera_mode\":\"lookat_xyz\",\"direction\":{\"mode\":\"derive_from_velocity\",\"custom_direction\":[0,0,0],\"min_speed_threshold\":0.1},\"uv\":{\"uv\":[\"variable.emitter_texture_coordinate.u + (variable.emitter_texture_size.u/4) * (variable.particle_random_1*3)\",\"variable.emitter_texture_coordinate.v + (variable.emitter_texture_size.v/4) * (variable.particle_random_2*3)\"],\"uv_size\":[\"variable.emitter_texture_size.u/4\",\"variable.emitter_texture_size.v/4\"]}},\"minecraft:particle_appearance_lighting\":{},\"minecraft:particle_appearance_tinting\":{\"color\":{\"gradient\":{\"0.000000\":[\"variable.color.r\",\"variable.color.g\",\"variable.color.b\",\"variable.color.a\"]},\"interpolant\":0}},\"minecraft:particle_initial_speed\":\"Math.random(0, 4) * variable.velocity_scalar\",\"minecraft:particle_lifetime_expression\":{\"max_lifetime\":\"0.2f / (Math.random(0.0, 1.0) * 0.9f + 0.1f)\"},\"minecraft:particle_motion_collision\":{\"collision_drag\":5,\"coefficient_of_restitution\":0.1,\"collision_radius\":0.1,\"events\":[]},\"minecraft:particle_motion_dynamic\":{\"linear_acceleration\":[0,-9.8,0],\"linear_drag_coefficient\":0.5}}}}","assets/particles/block_slide.json":"{\"format_version\":\"1.26.10\",\"particle_effect\":{\"description\":{\"identifier\":\"minecraft:block_slide\",\"basic_render_parameters\":{\"material\":\"particles_alpha\",\"texture\":\"atlas.terrain\"}},\"components\":{\"minecraft:emitter_lifetime_once\":{},\"minecraft:emitter_rate_instant\":{\"num_particles\":\"variable.emitter_particles_count\"},\"minecraft:emitter_shape_point\":{\"offset\":[\"Math.random(-variable.emitter_radius, variable.emitter_radius)\",\"Math.random(-variable.emitter_radius, variable.emitter_radius)\",\"Math.random(-variable.emitter_radius, variable.emitter_radius)\"],\"direction\":[\"Math.random(-1,1)\",-1,\"Math.random(-1, 1)\"]},\"minecraft:particle_appearance_billboard\":{\"size\":[\"variable.particle_random_1 * 0.0375 + 0.0375\",\"variable.particle_random_1 * 0.0375 + 0.0375\"],\"facing_camera_mode\":\"lookat_xyz\",\"direction\":{\"mode\":\"derive_from_velocity\",\"custom_direction\":[0,0,0],\"min_speed_threshold\":0.1},\"uv\":{\"uv\":[\"variable.emitter_texture_coordinate.u + (variable.emitter_texture_size.u/4) * (variable.particle_random_1*3)\",\"variable.emitter_texture_coordinate.v + (variable.emitter_texture_size.v/4) * (variable.particle_random_2*3)\"],\"uv_size\":[\"variable.emitter_texture_size.u/4\",\"variable.emitter_texture_size.v/4\"]}},\"minecraft:particle_appearance_lighting\":{},\"minecraft:particle_appearance_tinting\":{\"color\":{\"gradient\":{\"0.000000\":[\"variable.color.r\",\"variable.color.g\",\"variable.color.b\",\"variable.color.a\"]},\"interpolant\":0}},\"minecraft:particle_initial_speed\":\"Math.random(0, 4) * variable.velocity_scalar\",\"minecraft:particle_lifetime_expression\":{\"max_lifetime\":\"0.2f / (Math.random(0.0, 1.0) * 0.9f + 0.1f)\"},\"minecraft:particle_motion_collision\":{\"collision_drag\":5,\"coefficient_of_restitution\":0.1,\"collision_radius\":0.1,\"events\":[]},\"minecraft:particle_motion_dynamic\":{\"linear_acceleration\":[0,-9.8,0],\"linear_drag_coefficient\":0.5}}}}","dimension/overworld.flat.json":"{\"format_version\":\"1.0.0\",\"dimension\":{\"identifier\":\"minecraft:overworld\",\"biome\":\"minecraft:plains\",\"height\":64,\"render_distance\":4,\"spawn\":{\"x\":8.5,\"z\":8.5},\"generator\":{\"type\":\"flat\",\"layers\":[{\"block\":\"minecraft:dirt\",\"count\":3},{\"block\":\"minecraft:grass_block\",\"count\":1}]}}}","mods/example/blocks/glow_dirt.json":"{\"identifier\":\"example:glow_dirt\",\"components\":{\"displayname\":\"Glow Dirt\",\"category\":\"nature\",\"textures\":{\"*\":\"minecraft:block/dirt/dirt\"},\"lightdampening\":8,\"loot\":[\"minecraft:dirt\"]}}","mods/example/manifest.json":"{\"id\":\"example\",\"name\":\"Contoh Mod Native\",\"version\":\"1.0.0\",\"description\":\"Mod contoh: satu block baru yang memakai ulang tekstur dirt (tanpa menggandakan file). Aktifkan dengan menambahkan \\\"example\\\" ke mods/mods.json\",\"blocks\":[\"blocks/glow_dirt.json\"]}","mods/mods.json":"{\"enabled\":[]}","option.json":"{\"playerName\":\">_Console\",\"cameraSensitivity\":1,\"touchCircle\":{\"enabled\":true,\"size\":100},\"skinPath\":\"assets/skins/steve.png\",\"capePath\":\"assets/cape/cape.png\"}"};
class Assets {
  static url(p) { return IMG[p] || p; }
  static fetch(p, init) {
    if (p === "option.json") { // window.MineHTMLOptions menimpa nilai bawaan
      const base = JSON.parse(TXT[p]), o = window.MineHTMLOptions || {};
      const merged = { ...base, ...o, touchCircle: { ...base.touchCircle, ...(o.touchCircle || {}) } };
      return Promise.resolve(new Response(JSON.stringify(merged), { headers: { "Content-Type": "application/json" } }));
    }
    if (TXT[p]) return Promise.resolve(new Response(TXT[p], { headers: { "Content-Type": "application/json" } }));
    return fetch(p, init);
  }
}
return { Assets };
})();
const msrc_core_options_option_schema_js = (() => {
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

const OptionSchema = {
  playerName: name("Steve"),
  cameraSensitivity: num(1.0, 0.1, 5.0), // pengali sensitivitas dasar kamera
  touchCircle: {
    enabled: bool(true),
    size: num(72, 32, 160)               // diameter cincin sentuh (px)
  },
  skinPath: png("assets/skins/steve.png"),
  capePath: png("assets/cape/cape.png", true)
};

return { OptionSchema };
})();
const msrc_core_options_options_js = (() => {
const { Assets } = msrc_core_assets_js;
const { OptionSchema } = msrc_core_options_option_schema_js;

const isLeaf = node => typeof node.check === "function";

class Options {
  // Skema + data mentah -> objek valid penuh (kolom asing diabaikan)
  static sanitize(raw, schema = OptionSchema, path = "") {
    const src = raw !== null && typeof raw === "object" ? raw : {};
    const out = {};
    for (const key of Object.keys(schema)) {
      const node = schema[key];
      if (!isLeaf(node)) {
        out[key] = this.sanitize(src[key], node, path + key + ".");
        continue;
      }
      const v = node.check(src[key]);
      if (v === undefined && src[key] !== undefined) {
        console.warn(`[Options] "${path}${key}" tidak valid, memakai default:`, node.def);
      }
      out[key] = v === undefined ? node.def : v;
    }
    return out;
  }

  static defaults() {
    return this.sanitize({});
  }

  // Tidak pernah melempar error: gagal fetch/parse = default
  static async load(url = "option.json") {
    try {
      const res = await Assets.fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return this.sanitize(await res.json());
    } catch (err) {
      console.warn("[Options] option.json gagal dimuat, memakai default:", err);
      return this.defaults();
    }
  }
}

return { Options };
})();
const msrc_core_math_mat4_js = (() => {
class Mat4 {
  static create() {
    const out = new Float32Array(16);
    out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
    return out;
  }

  static copy(out, a) {
    for (let i = 0; i < 16; i++) out[i] = a[i];
    return out;
  }

  static perspective(out, fovyRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovyRad / 2);
    const nf = 1 / (near - far);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = (2 * far * near) * nf; out[15] = 0;
    return out;
  }

  static invert(out, a) {
    const b00 = a[0]*a[5] - a[1]*a[4], b01 = a[0]*a[6] - a[2]*a[4], b02 = a[0]*a[7] - a[3]*a[4];
    const b03 = a[1]*a[6] - a[2]*a[5], b04 = a[1]*a[7] - a[3]*a[5], b05 = a[2]*a[7] - a[3]*a[6];
    const b06 = a[8]*a[13] - a[9]*a[12], b07 = a[8]*a[14] - a[10]*a[12], b08 = a[8]*a[15] - a[11]*a[12];
    const b09 = a[9]*a[14] - a[10]*a[13], b10 = a[9]*a[15] - a[11]*a[13], b11 = a[10]*a[15] - a[11]*a[14];
    let det = b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06;
    if (!det) return null;
    det = 1.0 / det;
    out[0] = (a[5]*b11 - a[6]*b10 + a[7]*b09)*det; out[1] = (a[2]*b10 - a[1]*b11 - a[3]*b09)*det;
    out[2] = (a[13]*b05 - a[14]*b04 + a[15]*b03)*det; out[3] = (a[10]*b04 - a[9]*b05 - a[11]*b03)*det;
    out[4] = (a[6]*b08 - a[4]*b11 - a[7]*b07)*det; out[5] = (a[0]*b11 - a[2]*b08 + a[3]*b07)*det;
    out[6] = (a[14]*b02 - a[12]*b05 - a[15]*b01)*det; out[7] = (a[8]*b05 - a[10]*b02 + a[11]*b01)*det;
    out[8] = (a[4]*b10 - a[5]*b08 + a[7]*b06)*det; out[9] = (a[1]*b08 - a[0]*b10 - a[3]*b06)*det;
    out[10] = (a[12]*b04 - a[13]*b02 + a[15]*b00)*det; out[11] = (a[9]*b02 - a[8]*b04 - a[11]*b00)*det;
    out[12] = (a[5]*b07 - a[4]*b09 - a[6]*b06)*det; out[13] = (a[0]*b09 - a[1]*b07 + a[2]*b06)*det;
    out[14] = (a[13]*b01 - a[12]*b03 - a[14]*b00)*det; out[15] = (a[8]*b03 - a[9]*b01 + a[10]*b00)*det;
    return out;
  }

  static multiply(out, a, b) {
    for (let i = 0; i < 4; i++) {
      const ai0=a[i], ai1=a[i+4], ai2=a[i+8], ai3=a[i+12];
      out[i] = ai0*b[0] + ai1*b[1] + ai2*b[2] + ai3*b[3];
      out[i+4] = ai0*b[4] + ai1*b[5] + ai2*b[6] + ai3*b[7];
      out[i+8] = ai0*b[8] + ai1*b[9] + ai2*b[10] + ai3*b[11];
      out[i+12] = ai0*b[12] + ai1*b[13] + ai2*b[14] + ai3*b[15];
    }
    return out;
  }

  static translate(out, a, v) {
    const x = v[0], y = v[1], z = v[2];
    if (a !== out) for (let i = 0; i < 12; i++) out[i] = a[i];
    out[12] = a[0]*x + a[4]*y + a[8]*z + a[12];
    out[13] = a[1]*x + a[5]*y + a[9]*z + a[13];
    out[14] = a[2]*x + a[6]*y + a[10]*z + a[14];
    out[15] = a[3]*x + a[7]*y + a[11]*z + a[15];
    return out;
  }

  static rotateX(out, a, rad) {
    const s = Math.sin(rad), c = Math.cos(rad);
    const a10=a[4], a11=a[5], a12=a[6], a13=a[7], a20=a[8], a21=a[9], a22=a[10], a23=a[11];
    if (a !== out) {
      out[0]=a[0]; out[1]=a[1]; out[2]=a[2]; out[3]=a[3];
      out[12]=a[12]; out[13]=a[13]; out[14]=a[14]; out[15]=a[15];
    }
    out[4] = a10*c + a20*s; out[5] = a11*c + a21*s; out[6] = a12*c + a22*s; out[7] = a13*c + a23*s;
    out[8] = a20*c - a10*s; out[9] = a21*c - a11*s; out[10] = a22*c - a12*s; out[11] = a23*c - a13*s;
    return out;
  }

  static rotateY(out, a, rad) {
    const s = Math.sin(rad), c = Math.cos(rad);
    const a00=a[0], a01=a[1], a02=a[2], a03=a[3], a20=a[8], a21=a[9], a22=a[10], a23=a[11];
    if (a !== out) {
      out[4]=a[4]; out[5]=a[5]; out[6]=a[6]; out[7]=a[7];
      out[12]=a[12]; out[13]=a[13]; out[14]=a[14]; out[15]=a[15];
    }
    out[0] = a00*c - a20*s; out[1] = a01*c - a21*s; out[2] = a02*c - a22*s; out[3] = a03*c - a23*s;
    out[8] = a00*s + a20*c; out[9] = a01*s + a21*c; out[10] = a02*s + a22*c; out[11] = a03*s + a23*c;
    return out;
  }

  static rotateZ(out, a, rad) {
    const s = Math.sin(rad), c = Math.cos(rad);
    const a00=a[0], a01=a[1], a02=a[2], a03=a[3], a10=a[4], a11=a[5], a12=a[6], a13=a[7];
    if (a !== out) {
      out[8]=a[8]; out[9]=a[9]; out[10]=a[10]; out[11]=a[11];
      out[12]=a[12]; out[13]=a[13]; out[14]=a[14]; out[15]=a[15];
    }
    out[0] = a00*c + a10*s; out[1] = a01*c + a11*s; out[2] = a02*c + a12*s; out[3] = a03*c + a13*s;
    out[4] = a10*c - a00*s; out[5] = a11*c - a01*s; out[6] = a12*c - a02*s; out[7] = a13*c - a03*s;
    return out;
  }
}
return { Mat4 };
})();
const msrc_features_camera_camera_js = (() => {
const { Mat4 } = msrc_core_math_mat4_js;

// Urutan tombol perspektif Minecraft: Dalam -> Belakang -> Depan -> Dalam
const PerspectiveMode = {
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

class Camera {
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

return { PerspectiveMode, Camera };
})();
const msrc_features_camera_ui_perspective_btn_js = (() => {
const { Assets } = msrc_core_assets_js;
class PerspectiveButton {
  constructor(camera) {
    this.camera = camera;
    this.button = null;
    this.onTouchStart = this.handleTouchStart.bind(this);
    this.onTouchEnd = this.handleTouchEnd.bind(this);
    this.init();
  }

  init() {
    const btn = document.createElement("button");
    btn.id = "btn-perspective";
    btn.style.cssText = `
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%) scale(1.0);
      width: 36px;
      height: 36px;
      padding: 0;
      margin: 0;
      background-color: transparent;
      background-image: url('${Assets.url("assets/control/perspective.png")}');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 32px 32px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      border: none;
      outline: none;
      box-shadow: none;
      touch-action: none;
      z-index: 10000;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.08s ease;
    `;

    btn.addEventListener("touchstart", this.onTouchStart, { passive: false });
    btn.addEventListener("touchend", this.onTouchEnd, { passive: true });
    btn.addEventListener("touchcancel", this.onTouchEnd, { passive: true });

    document.body.appendChild(btn);
    this.button = btn;
  }

  handleTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();

    // Efek tekan tombol halus tanpa kotak background
    this.button.style.transform = "translateX(-50%) scale(0.86)";
    this.camera.cyclePerspective();
  }

  handleTouchEnd() {
    if (this.button) {
      this.button.style.transform = "translateX(-50%) scale(1.0)";
    }
  }

  dispose() {
    if (this.button) {
      this.button.removeEventListener("touchstart", this.onTouchStart);
      this.button.removeEventListener("touchend", this.onTouchEnd);
      this.button.removeEventListener("touchcancel", this.onTouchEnd);
      if (this.button.parentNode) this.button.parentNode.removeChild(this.button);
    }
    this.button = null;
    this.camera = null;
  }
}
return { PerspectiveButton };
})();
const msrc_shaders_RenderVulkan_shader_program_js = (() => {
class ShaderProgram {
  static create(gl, vsSource, fsSource) {
    const vs = this.compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    // Tandai flag shader untuk segera dihapus saat program dilepas
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error("Link Program Shader Gagal: " + err);
    }

    return program;
  }

  static compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source.trim());
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("Kompilasi Shader Gagal: " + err);
    }
    return shader;
  }

  static dispose(gl, program) {
    if (gl && program) {
      gl.deleteProgram(program);
    }
  }
}
return { ShaderProgram };
})();
const msrc_shaders_RenderVulkan_fullscreen_quad_js = (() => {
// Dua segitiga penutup layar (NDC -1..1, atribut 0 = vec2). Dipakai lapisan langit dan efek layar penuh.
const VERTICES = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

class FullscreenQuad {
  static create(gl) {
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return { vao, vbo };
  }

  static draw(gl, quad) {
    gl.bindVertexArray(quad.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  static dispose(gl, quad) {
    if (!gl || !quad) return;
    gl.deleteBuffer(quad.vbo);
    gl.deleteVertexArray(quad.vao);
    quad.vbo = quad.vao = null;
  }
}

return { FullscreenQuad };
})();
const msrc_shaders_VulkanGL_v1_0_player_js = (() => {
const PlayerShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec3 a_normal;

    uniform mat4 u_projection;
    uniform mat4 u_modelView;
    uniform mat4 u_normalMatrix;

    out vec2 v_uv;
    out float v_light;

    void main() {
      v_uv = a_uv;
      // Cahaya entitas Minecraft: dua arah dari atas + ambient 0.4.
      // Normal diputar oleh matriks model (dunia), bukan kamera,
      // jadi pencahayaan tidak ikut berubah saat kamera berputar.
      vec3 n = normalize(mat3(u_normalMatrix) * a_normal);
      vec3 l0 = normalize(vec3(0.2, 1.0, -0.7));
      vec3 l1 = normalize(vec3(-0.2, 1.0, 0.7));
      float diff = max(dot(n, l0), 0.0) + max(dot(n, l1), 0.0);
      v_light = min(1.0, 0.4 + 0.6 * diff);

      gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec2 v_uv;
    in float v_light;
    uniform sampler2D u_texture;
    out vec4 fragColor;

    void main() {
      vec4 texColor = texture(u_texture, v_uv);
      if (texColor.a < 0.1) discard;
      fragColor = vec4(texColor.rgb * v_light, texColor.a);
    }
  `
};

return { PlayerShader };
})();
const msrc_shaders_VulkanGL_v1_0_sky_js = (() => {
const SkyShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec2 a_position;
    uniform mat4 u_invViewProj;
    out vec3 v_rayDir;

    void main() {
      // Unproject layar NDC ke vektor arah pandangan 3D
      vec4 farPoint = u_invViewProj * vec4(a_position, 1.0, 1.0);
      v_rayDir = farPoint.xyz / farPoint.w;
      gl_Position = vec4(a_position, 1.0, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec3 v_rayDir;
    out vec4 fragColor;

    const vec3 c_horizon = vec3(0.753, 0.847, 1.0);
    const vec3 c_zenith  = vec3(0.290, 0.525, 0.910);
    const vec3 c_void    = vec3(0.100, 0.100, 0.120);

    void main() {
      vec3 dir = normalize(v_rayDir);
      float y = dir.y;
      vec3 skyColor;

      if (y >= 0.0) {
        float factor = pow(y, 0.65);
        skyColor = mix(c_horizon, c_zenith, factor);
      } else {
        float factor = pow(-y, 1.2);
        skyColor = mix(c_horizon, c_void, factor);
      }

      fragColor = vec4(skyColor, 1.0);
    }
  `
};
return { SkyShader };
})();
const msrc_shaders_VulkanGL_v1_0_sun_js = (() => {
// Billboard di langit: hanya rotasi kamera yang dipakai (translasi dibuang), jadi matahari
// selalu berada "di tak hingga" dan tidak ikut bergeser saat pemain berjalan.
const SunShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec2 a_corner; // -1..1 (FullscreenQuad)
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform vec3 u_center; // arah * jarak
    uniform vec3 u_right;  // sumbu kanan * setengah lebar
    uniform vec3 u_up;     // sumbu atas * setengah tinggi
    out vec2 v_uv;

    void main() {
      v_uv = vec2(a_corner.x, -a_corner.y) * 0.5 + 0.5;
      vec3 world = u_center + u_right * a_corner.x + u_up * a_corner.y;
      gl_Position = u_projection * vec4(mat3(u_view) * world, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec2 v_uv;
    uniform sampler2D u_texture;
    out vec4 fragColor;

    void main() {
      // Latar sun.png hitam: ditambahkan (additive), jadi hanya bagian terang yang terlihat
      fragColor = vec4(texture(u_texture, v_uv).rgb, 1.0);
    }
  `
};

return { SunShader };
})();
const msrc_shaders_VulkanGL_v1_0_cloud_js = (() => {
const { SkyShader } = msrc_shaders_VulkanGL_v1_0_sky_js;

// Awan 3D ala Minecraft Java (Fancy): sel 12x12 blok, tebal 4 blok, tanpa geometri.
// Tiap piksel menembakkan sinar ke lempeng awan [base, top], lalu menelusuri grid sel (DDA)
// sampai kena sel berisi di clouds.png. Hanya muka terdepan yang digambar (setara depth pre-pass MC),
// jadi tidak ada penumpukan alpha. Shade muka = Minecraft: atas 1.0, timur/barat 0.9, utara/selatan 0.8, bawah 0.7.
const CloudShader = {
  vertex: SkyShader.vertex,
  fragment: `#version 300 es
      precision highp float;
      precision highp int;
      in vec3 v_rayDir;
      uniform sampler2D u_texture;
      uniform vec3 u_camPos;
      uniform vec4 u_cloud;  // x = y dasar, y = y atas, z = geseran angin (blok), w = ukuran sel (blok)
      uniform vec3 u_fade;   // x = mulai pudar, y = hilang total (blok mendatar), z = alpha awan
      out vec4 fragColor;

      const int MAX_STEPS = 96; // cukup untuk jarak pudar 650 blok / sel 12

      void main() {
        vec3 o = u_camPos;
        vec3 d = normalize(v_rayDir - o);
        float cell = u_cloud.w;
        float lenXZ = length(d.xz);
        float tEnd = u_fade.y / max(lenXZ, 1e-4);   // batas jarak sinar (sesuai batas pudar)
        float tIn = 0.0;
        int face = -1;                               // 0 atas, 1 bawah, 2 sisi X, 3 sisi Z, -1 kamera di dalam awan

        if (abs(d.y) < 1e-5) {
          if (o.y < u_cloud.x || o.y > u_cloud.y) discard;
        } else {
          float ta = (u_cloud.x - o.y) / d.y;
          float tb = (u_cloud.y - o.y) / d.y;
          float tf = max(ta, tb);
          if (tf <= 0.0) discard;
          float tn = min(ta, tb);
          if (tn > 0.0) { tIn = tn; face = d.y < 0.0 ? 0 : 1; }
          tEnd = min(tf, tEnd);
        }
        if (tIn >= tEnd) discard;

        vec2 p = o.xz + d.xz * tIn + vec2(u_cloud.z, 0.0);
        vec2 stp = vec2(d.x >= 0.0 ? 1.0 : -1.0, d.z >= 0.0 ? 1.0 : -1.0);
        vec2 inv = 1.0 / max(abs(d.xz), vec2(1e-6));
        vec2 c = floor(p / cell);
        vec2 tNext = tIn + ((c + step(0.0, stp)) * cell - p) * stp * inv;
        float t = tIn;
        int hit = -2;

        for (int i = 0; i < MAX_STEPS; i++) {
          if (texelFetch(u_texture, ivec2(c) & 255, 0).a >= 0.5) {
            hit = face;
            if (face < 0) {                          // di dalam sel: tampilkan dinding dalam
              float te = min(tNext.x, tNext.y);
              if (te >= tEnd) { hit = d.y > 0.0 ? 0 : 1; t = tEnd; }
              else { hit = tNext.x < tNext.y ? 2 : 3; t = te; }
            }
            break;
          }
          if (tNext.x < tNext.y) {
            t = tNext.x; if (t >= tEnd) break;
            c.x += stp.x; tNext.x += cell * inv.x; face = 2;
          } else {
            t = tNext.y; if (t >= tEnd) break;
            c.y += stp.y; tNext.y += cell * inv.y; face = 3;
          }
        }
        if (hit == -2) discard;

        float fade = 1.0 - smoothstep(u_fade.x, u_fade.y, t * lenXZ);
        if (fade <= 0.0) discard;
        float shade = hit == 0 ? 1.0 : (hit == 1 ? 0.7 : (hit == 2 ? 0.9 : 0.8));
        fragColor = vec4(vec3(shade), u_fade.z * fade);
      }
  `
};

return { CloudShader };
})();
const msrc_shaders_VulkanGL_v1_0_nametag_js = (() => {
// Billboard: pusat label dihitung di ruang kamera, sehingga selalu menghadap layar
const NametagShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec2 a_corner; // -0.5..0.5
    uniform mat4 u_projection;
    uniform vec3 u_center;                 // pusat label (ruang kamera)
    uniform vec2 u_size;                   // lebar, tinggi (blok)
    out vec2 v_uv;

    void main() {
      v_uv = vec2(a_corner.x + 0.5, 0.5 - a_corner.y);
      gl_Position = u_projection * vec4(u_center + vec3(a_corner * u_size, 0.0), 1.0);
    }
  `,
  fragment: `#version 300 es
    precision mediump float;
    in vec2 v_uv;
    uniform sampler2D u_texture;
    out vec4 fragColor;

    void main() {
      fragColor = texture(u_texture, v_uv); // alpha sudah premultiplied
    }
  `
};

return { NametagShader };
})();
const msrc_shaders_VulkanGL_v1_0_blocks_js = (() => {
// Block: satu atlas; overlay (rumput samping) diwarnai terpisah; kabut linear sesuai biome.
const BlocksShader = {
  vertex: `#version 300 es
    layout(location = 0) in vec3 a_pos;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec2 a_ov;
    layout(location = 3) in vec3 a_col;
    layout(location = 4) in vec3 a_ovcol;
    uniform mat4 u_viewProj;
    uniform vec3 u_chunk;
    uniform vec3 u_cam;
    out vec2 v_uv;
    out vec2 v_ov;
    out vec3 v_col;
    out vec3 v_ovcol;
    out float v_dist;

    void main() {
      vec3 w = a_pos + u_chunk;
      v_uv = a_uv; v_ov = a_ov; v_col = a_col; v_ovcol = a_ovcol;
      v_dist = length(w - u_cam);
      gl_Position = u_viewProj * vec4(w, 1.0);
    }
  `,
  fragment: `#version 300 es
    precision highp float;
    in vec2 v_uv;
    in vec2 v_ov;
    in vec3 v_col;
    in vec3 v_ovcol;
    in float v_dist;
    uniform sampler2D u_atlas;
    uniform vec3 u_fogColor;
    uniform vec2 u_fog;
    out vec4 fragColor;

    void main() {
      vec4 t = texture(u_atlas, v_uv);
      if (t.a < 0.5) discard;
      vec3 rgb = t.rgb * v_col;
      if (v_ov.x >= 0.0) {
        vec4 o = texture(u_atlas, v_ov);
        rgb = mix(rgb, o.rgb * v_ovcol, o.a);
      }
      float f = clamp((v_dist - u_fog.x) / (u_fog.y - u_fog.x), 0.0, 1.0);
      fragColor = vec4(mix(rgb, u_fogColor, f), 1.0);
    }
  `
};

return { BlocksShader };
})();
const msrc_shaders_VulkanGL_v1_0_pack_js = (() => {
const { PlayerShader } = msrc_shaders_VulkanGL_v1_0_player_js;
const { SkyShader } = msrc_shaders_VulkanGL_v1_0_sky_js;
const { SunShader } = msrc_shaders_VulkanGL_v1_0_sun_js;
const { CloudShader } = msrc_shaders_VulkanGL_v1_0_cloud_js;
const { NametagShader } = msrc_shaders_VulkanGL_v1_0_nametag_js;
const { BlocksShader } = msrc_shaders_VulkanGL_v1_0_blocks_js;

// Shader pack bawaan. Kunci di 'shaders' = nama yang dipakai fitur lewat ShaderPack.create(gl, nama).
const VulkanGL = {
  id: "shaders.vulkangl",
  name: "VulkanGL",
  version: "1.0",
  shaders: {
    player: PlayerShader,
    sky: SkyShader,
    sun: SunShader,
    clouds: CloudShader,
    nametag: NametagShader,
    blocks: BlocksShader
  }
};

return { VulkanGL };
})();
const msrc_shaders_shader_pack_js = (() => {
const { ShaderProgram } = msrc_shaders_RenderVulkan_shader_program_js;
const { VulkanGL } = msrc_shaders_VulkanGL_v1_0_pack_js;

const packs = new Map([[VulkanGL.id, VulkanGL]]);
let active = VulkanGL;

const isSource = s => s && typeof s.vertex === "string" && typeof s.fragment === "string";

// Pintu tunggal ke shader. Pack buatan mod boleh parsial: shader yang tidak ada diambil dari VulkanGL.
class ShaderPack {
  // pack: { id, name, version, shaders: { nama: { vertex, fragment } } }
  static register(pack) {
    const ok = pack && typeof pack.id === "string" && pack.shaders && Object.values(pack.shaders).every(isSource);
    if (!ok) throw new Error("Shader pack tidak valid");
    packs.set(pack.id, pack);
  }

  static use(id) {
    const pack = packs.get(id);
    if (!pack) { console.warn("[ShaderPack] pack tidak dikenal:", id); return false; }
    active = pack; // berlaku untuk program yang dibuat setelah ini
    return true;
  }

  static get(name) {
    const src = active.shaders[name] || VulkanGL.shaders[name];
    if (!src) throw new Error(`Shader "${name}" tidak ada di pack mana pun`);
    return src;
  }

  static create(gl, name) {
    const src = this.get(name);
    return ShaderProgram.create(gl, src.vertex, src.fragment);
  }
}

return { ShaderPack };
})();
const msrc_shaders_RenderVulkan_texture_loader_js = (() => {
const { Assets } = msrc_core_assets_js;
class TextureLoader {
  // rgba: warna placeholder 1x1 sebelum gambar selesai dimuat (default abu-abu netral)
  static createDefault(gl, rgba = [180, 180, 180, 255]) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(rgba));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // tanpa mipmap: tekstur lengkap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return tex;
  }

  // fallbackUrl: dicoba sekali bila url gagal dimuat (mis. skin/jubah dari option.json hilang)
  static load(gl, url, fallbackUrl = null, placeholder = undefined, onLoad = null) {
    const texture = this.createDefault(gl, placeholder);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      
      // Filter Nearest khas Minecraft (Pixel Art murni tanpa blur)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null);
      img.onload = img.onerror = null; // lepas referensi callback
      if (onLoad) onLoad();
    };
    img.onerror = () => {
      if (fallbackUrl && fallbackUrl !== url) {
        const next = fallbackUrl;
        fallbackUrl = null; // hanya sekali, tanpa loop
        console.warn(`[TextureLoader] ${url} gagal dimuat, memakai ${next}`);
        img.src = Assets.url(next);
      } else {
        console.warn("[TextureLoader] Gagal memuat:", url);
        img.onload = img.onerror = null;
      }
    };
    img.src = Assets.url(url);
    return texture;
  }

  // Unggah canvas 2D ke tekstur (bila 'texture' diberikan, tekstur lama dipakai ulang)
  static fromCanvas(gl, canvas, texture = null, linear = true) {
    const tex = texture || gl.createTexture();
    const filter = linear ? gl.LINEAR : gl.NEAREST;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  static dispose(gl, texture) {
    if (gl && texture) gl.deleteTexture(texture);
  }
}
return { TextureLoader };
})();
const msrc_features_sky_sun_sun_renderer_js = (() => {
const { ShaderProgram } = msrc_shaders_RenderVulkan_shader_program_js;
const { TextureLoader } = msrc_shaders_RenderVulkan_texture_loader_js;
const { FullscreenQuad } = msrc_shaders_RenderVulkan_fullscreen_quad_js;
const { ShaderPack } = msrc_shaders_shader_pack_js;

const TEXTURE = "assets/sky/sun.png";
const DISTANCE = 100;      // jarak billboard dari kamera (blok)
const HALF_SIZE = 30;      // setengah sisi billboard, seperti Minecraft (60 blok lebar)
const DEG = Math.PI / 180;
const HIDE_BELOW = -0.35;  // sin(elevasi) di bawah ini = jauh di bawah cakrawala, tidak digambar

// Matahari Minecraft: bergerak di bidang timur (+X) - barat (-X); elevasi 0 = cakrawala timur,
// 90 = zenith. Siklus siang/malam nanti cukup memanggil setElevation(derajat).
class SunRenderer {
  constructor(glContext, elevation = 40) {
    const gl = this.gl = glContext.getGL();
    this.program = ShaderPack.create(gl, "sun");
    const loc = n => gl.getUniformLocation(this.program, n);
    this.u = { proj: loc("u_projection"), view: loc("u_view"), center: loc("u_center"),
      right: loc("u_right"), up: loc("u_up"), tex: loc("u_texture") };
    this.quad = FullscreenQuad.create(gl);
    // Placeholder hitam: sebelum/bila gagal dimuat, additive tidak menambah cahaya apa pun
    this.texture = TextureLoader.load(gl, TEXTURE, null, [0, 0, 0, 255]);
    this.sin = 0;
    this.cos = 1;
    this.dirty = true;
    this.setElevation(elevation);
  }

  setElevation(deg) {
    this.sin = Math.sin(deg * DEG);
    this.cos = Math.cos(deg * DEG);
    this.dirty = true;
  }

  render(camera) {
    const gl = this.gl;
    if (!gl || !this.program || this.sin < HIDE_BELOW) return;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.u.tex, 0);
    gl.uniformMatrix4fv(this.u.proj, false, camera.projMatrix);
    gl.uniformMatrix4fv(this.u.view, false, camera.viewMatrix);
    if (this.dirty) { // uniform arah hanya diunggah saat elevasi berubah
      this.dirty = false;
      gl.uniform3f(this.u.center, this.cos * DISTANCE, this.sin * DISTANCE, 0);
      gl.uniform3f(this.u.right, 0, 0, HALF_SIZE);
      gl.uniform3f(this.u.up, -this.sin * HALF_SIZE, this.cos * HALF_SIZE, 0);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    FullscreenQuad.draw(gl, this.quad);
    gl.disable(gl.BLEND);
  }

  dispose() {
    const gl = this.gl;
    if (gl) {
      FullscreenQuad.dispose(gl, this.quad);
      TextureLoader.dispose(gl, this.texture);
      ShaderProgram.dispose(gl, this.program);
    }
    this.quad = this.texture = this.program = this.gl = null;
  }
}

return { SunRenderer };
})();
const msrc_features_sky_clouds_cloud_renderer_js = (() => {
const { ShaderProgram } = msrc_shaders_RenderVulkan_shader_program_js;
const { TextureLoader } = msrc_shaders_RenderVulkan_texture_loader_js;
const { FullscreenQuad } = msrc_shaders_RenderVulkan_fullscreen_quad_js;
const { ShaderPack } = msrc_shaders_shader_pack_js;

const TEXTURE = "assets/sky/clouds.png"; // 256x256, 1 piksel = 1 sel awan

// Semua angka awan di satu tempat. Nilai default = Minecraft Java (Fancy clouds).
// Ubah lewat: new CloudRenderer(glContext, { height: 192 }) atau CloudRenderer.defaults.
const CloudConfig = {
  height: 128,     // y dasar awan (blok). MC lama 128; MC 1.18+ memakai 192
  thickness: 4,    // tebal awan (blok), sama seperti Minecraft
  cell: 12,        // sisi satu sel awan (blok), sama seperti Minecraft
  wind: 0.6,       // blok/detik (0,03 blok/tick ala Minecraft Java)
  alpha: 0.8,      // keburaman awan Minecraft
  fadeStart: 300,  // jarak mendatar mulai memudar (blok)
  fadeEnd: 650     // jarak mendatar awan hilang total (blok)
};

// Awan 3D tanpa geometri: satu pass layar penuh, ray-march grid di fragment shader.
class CloudRenderer {
  constructor(glContext, config = {}) {
    const gl = this.gl = glContext.getGL();
    this.cfg = { ...CloudConfig, ...config };
    this.period = this.cfg.cell * 256; // satu putaran tekstur (blok)
    this.program = ShaderPack.create(gl, "clouds");
    const loc = n => gl.getUniformLocation(this.program, n);
    this.u = { inv: loc("u_invViewProj"), tex: loc("u_texture"), cam: loc("u_camPos"), cloud: loc("u_cloud"), fade: loc("u_fade") };
    this.quad = FullscreenQuad.create(gl);
    this.ready = false; // jangan gambar sebelum clouds.png termuat
    this.texture = TextureLoader.load(gl, TEXTURE, null, [0, 0, 0, 0], () => { this.ready = true; });
    this.t0 = performance.now();
  }

  render(camera) {
    const gl = this.gl;
    if (!gl || !this.program || !this.ready) return;
    const c = this.cfg, cam = camera.position;
    const wind = ((performance.now() - this.t0) * 0.001 * c.wind) % this.period; // tetap kecil agar presisi terjaga

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.u.tex, 0);
    gl.uniformMatrix4fv(this.u.inv, false, camera.getInvViewProj());
    gl.uniform3f(this.u.cam, cam[0], cam[1], cam[2]);
    gl.uniform4f(this.u.cloud, c.height, c.height + c.thickness, wind, c.cell);
    gl.uniform3f(this.u.fade, c.fadeStart, c.fadeEnd, c.alpha);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    FullscreenQuad.draw(gl, this.quad);
    gl.disable(gl.BLEND);
  }

  dispose() {
    const gl = this.gl;
    if (gl) {
      FullscreenQuad.dispose(gl, this.quad);
      TextureLoader.dispose(gl, this.texture);
      ShaderProgram.dispose(gl, this.program);
    }
    this.quad = this.texture = this.program = this.gl = null;
  }
}

return { CloudConfig, CloudRenderer };
})();
const msrc_features_sky_sky_renderer_js = (() => {
const { ShaderProgram } = msrc_shaders_RenderVulkan_shader_program_js;
const { FullscreenQuad } = msrc_shaders_RenderVulkan_fullscreen_quad_js;
const { ShaderPack } = msrc_shaders_shader_pack_js;
const { SunRenderer } = msrc_features_sky_sun_sun_renderer_js;
const { CloudRenderer } = msrc_features_sky_clouds_cloud_renderer_js;

class SkyRenderer {
  constructor(glContext) {
    this.gl = glContext.getGL();
    this.program = ShaderPack.create(this.gl, "sky");
    this.uInvViewProjLoc = this.gl.getUniformLocation(this.program, "u_invViewProj");
    this.quad = FullscreenQuad.create(this.gl);
    // Lapisan langit digambar berurutan (belakang -> depan). Tiap lapisan: render(camera) dan dispose().
    // Menambah bulan/bintang cukup menambah satu entri di sini.
    this.layers = [new SunRenderer(glContext), new CloudRenderer(glContext)];
  }

  render(camera) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uInvViewProjLoc, false, camera.getInvViewProj());
    FullscreenQuad.draw(gl, this.quad);
    for (let i = 0; i < this.layers.length; i++) this.layers[i].render(camera);
  }

  dispose() {
    const gl = this.gl;
    this.layers.forEach(l => l.dispose());
    this.layers = [];
    if (gl) {
      FullscreenQuad.dispose(gl, this.quad);
      ShaderProgram.dispose(gl, this.program);
    }
    this.quad = null;
    this.program = null;
    this.gl = null;
  }
}

return { SkyRenderer };
})();
const msrc_features_player_nametag_nametag_texture_js = (() => {
const { TextureLoader } = msrc_shaders_RenderVulkan_texture_loader_js;

const FONT = "bold 28px monospace";
const HEIGHT_PX = 36;
const PAD_PX = 12;

// Satu canvas + satu tekstur GPU dipakai ulang untuk setiap pergantian nama (tanpa leak)
class NametagTexture {
  constructor(gl) {
    this.gl = gl;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.texture = null;
    this.aspect = 1; // lebar / tinggi
    this.text = null;
  }

  setText(text) {
    if (!this.gl || text === this.text) return;
    this.text = text;
    const c = this.canvas, ctx = this.ctx;
    ctx.font = FONT;
    c.width = Math.ceil(ctx.measureText(text).width) + PAD_PX * 2; // ukuran berubah = state canvas reset
    c.height = HEIGHT_PX;
    ctx.font = FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, c.width / 2, c.height / 2 + 1);
    this.aspect = c.width / c.height;
    this.texture = TextureLoader.fromCanvas(this.gl, c, this.texture);
  }

  dispose() {
    TextureLoader.dispose(this.gl, this.texture);
    this.texture = null;
    this.canvas.width = this.canvas.height = 0; // lepas memori bitmap
    this.canvas = this.ctx = this.gl = null;
  }
}

return { NametagTexture };
})();
const msrc_features_player_nametag_nametag_renderer_js = (() => {
const { ShaderProgram } = msrc_shaders_RenderVulkan_shader_program_js;
const { PerspectiveMode } = msrc_features_camera_camera_js;
const { ShaderPack } = msrc_shaders_shader_pack_js;
const { NametagTexture } = msrc_features_player_nametag_nametag_texture_js;

const LABEL_HEIGHT = 0.25; // tinggi label (blok)
const LABEL_Y = 2.2;       // pusat label di atas telapak kaki (kepala ~1,9)
const SNEAK_DROP = 0.125;  // turun saat jongkok, sama dengan model pemain
const CORNERS = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);

// Nama hanya tampil di orang kedua (depan) dan orang ketiga (belakang), bukan orang pertama.
class NametagRenderer {
  constructor(glContext, name) {
    this.gl = glContext.getGL();
    const gl = this.gl;
    this.program = ShaderPack.create(gl, "nametag");
    this.u = {
      proj: gl.getUniformLocation(this.program, "u_projection"),
      center: gl.getUniformLocation(this.program, "u_center"),
      size: gl.getUniformLocation(this.program, "u_size"),
      tex: gl.getUniformLocation(this.program, "u_texture")
    };
    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, CORNERS, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.label = new NametagTexture(gl);
    this.label.setText(name);
  }

  setName(name) {
    if (this.label) this.label.setText(name);
  }

  // state: PlayerState (pos, sneakAmt)
  render(camera, state) {
    if (!this.program || camera.mode === PerspectiveMode.FIRST_PERSON) return;
    const gl = this.gl, v = camera.viewMatrix, p = state.pos;
    const x = p[0], y = p[1] + LABEL_Y - SNEAK_DROP * state.sneakAmt, z = p[2];

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.label.texture);
    gl.uniform1i(this.u.tex, 0);
    gl.uniformMatrix4fv(this.u.proj, false, camera.projMatrix);
    gl.uniform3f(this.u.center,
      v[0] * x + v[4] * y + v[8] * z + v[12],
      v[1] * x + v[5] * y + v[9] * z + v[13],
      v[2] * x + v[6] * y + v[10] * z + v[14]);
    gl.uniform2f(this.u.size, LABEL_HEIGHT * this.label.aspect, LABEL_HEIGHT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false); // latar transparan tidak boleh menutup objek di belakangnya
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
  }

  dispose() {
    const gl = this.gl;
    if (gl) {
      gl.deleteBuffer(this.vbo);
      gl.deleteVertexArray(this.vao);
      ShaderProgram.dispose(gl, this.program);
    }
    if (this.label) this.label.dispose();
    this.label = this.program = this.gl = null;
  }
}

return { NametagRenderer };
})();
const msrc_shaders_RenderVulkan_mesh_vao_js = (() => {
// Pemilik VAO + semua VBO-nya, sehingga dispose tidak menyisakan buffer GPU (leak).
class MeshVao {
  static create(gl, mesh) {
    if (!mesh) return null;
    const vao = gl.createVertexArray();
    const buffers = [];
    gl.bindVertexArray(vao);
    [[0, 3, mesh.positions], [1, 2, mesh.uvs], [2, 3, mesh.normals]].forEach(([loc, size, data]) => {
      const vbo = gl.createBuffer();
      buffers.push(vbo);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    });
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return { vao, buffers, count: mesh.positions.length / 3 };
  }

  static draw(gl, mesh) {
    gl.bindVertexArray(mesh.vao);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  static dispose(gl, mesh) {
    if (!gl || !mesh) return;
    mesh.buffers.forEach(b => gl.deleteBuffer(b));
    gl.deleteVertexArray(mesh.vao);
    mesh.buffers = [];
    mesh.vao = null;
  }
}

return { MeshVao };
})();
const msrc_features_player_model_geo_parser_js = (() => {
class GeoParser {
  static extractBoneCubes(geoJson, boneName) {
    const geometry = geoJson["minecraft:geometry"][0];
    const texW = geometry.description.texture_width || 64;
    const texH = geometry.description.texture_height || 64;
    const bone = geometry.bones.find(b => b.name === boneName);
    if (!bone || !bone.cubes) return null;

    const pos = [], uvs = [], norm = [];
    bone.cubes.forEach(cube => {
      const inf = cube.inflate || 0.0;
      this.buildArmCube(cube.uv, texW, texH, inf, pos, uvs, norm);
    });

    return {
      positions: new Float32Array(pos),
      uvs: new Float32Array(uvs),
      normals: new Float32Array(norm)
    };
  }

  static buildArmCube(uv, tw, th, inf, pos, uvs, norm) {
    // Koordinat relatif bahu: X[-3, 1], Y[-2, 10] (ke bawah), Z[-2, 2]
    const x0 = (-3.0 - inf) * 0.0625, x1 = (1.0 + inf) * 0.0625;
    const y0 = (-2.0 - inf) * 0.0625, y1 = (10.0 + inf) * 0.0625;
    const z0 = (-2.0 - inf) * 0.0625, z1 = (2.0 + inf) * 0.0625;
    const [u, v] = uv;
    const [w, h, d] = [4, 12, 4];

    const faces = [
      // Top / Bahu (-Y)
      { n: [0, -1, 0], v: [x0,y0,z0, x1,y0,z0, x1,y0,z1, x0,y0,z1], uv: [u+d, v, w, d] },
      // Bottom / Telapak (+Y)
      { n: [0,  1, 0], v: [x0,y1,z1, x1,y1,z1, x1,y1,z0, x0,y1,z0], uv: [u+d+w, v, w, d] },
      // Front / Depan (-Z)
      { n: [0, 0, -1], v: [x1,y0,z0, x0,y0,z0, x0,y1,z0, x1,y1,z0], uv: [u+d, v+d, w, h] },
      // Back / Belakang (+Z)
      { n: [0, 0,  1], v: [x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1], uv: [u+d+w+d, v+d, w, h] },
      // West / Luar (-X)
      { n: [-1, 0, 0], v: [x0,y0,z0, x0,y0,z1, x0,y1,z1, x0,y1,z0], uv: [u, v+d, d, h] },
      // East / Dalam (+X)
      { n: [ 1, 0, 0], v: [x1,y0,z1, x1,y0,z0, x1,y1,z0, x1,y1,z1], uv: [u+d+w, v+d, d, h] }
    ];

    faces.forEach(f => {
      const [u0, v0, uw, vh] = [f.uv[0]/tw, f.uv[1]/th, f.uv[2]/tw, f.uv[3]/th];
      const indices = [0, 1, 2, 0, 2, 3];
      const quadUvs = [[u0, v0], [u0+uw, v0], [u0+uw, v0+vh], [u0, v0+vh]];

      indices.forEach(idx => {
        pos.push(f.v[idx*3], f.v[idx*3+1], f.v[idx*3+2]);
        norm.push(...f.n);
        uvs.push(quadUvs[idx][0], quadUvs[idx][1]);
      });
    });
  }
}
return { GeoParser };
})();
const msrc_features_player_model_model_const_js = (() => {
// Skala Minecraft: 1 piksel model = 1/16 blok, entitas pemain diskalakan 15/16
const MODEL_SCALE = 0.9375;
const PX = (1 / 16) * MODEL_SCALE;

// Pivot leher / bahu atas (24 piksel dari telapak kaki)
const NECK_Y = 24 * PX;

// Permukaan punggung badan (setengah tebal badan = 2 piksel)
const BODY_BACK_Z = 2 * PX;

return { MODEL_SCALE, PX, NECK_Y, BODY_BACK_Z };
})();
const msrc_features_player_model_box_builder_js = (() => {
const { PX } = msrc_features_player_model_model_const_js;

// Pembangun kotak universal (layout UV Minecraft Java/Bedrock).
// Konvensi: pemain menghadap -Z, sisi "Right" karakter berada di +X.
class BoxBuilder {
  static create() {
    return { pos: [], uvs: [], norm: [] };
  }

  // Kubus Bedrock relatif terhadap pivot -> sumbu X dicerminkan agar bone "Right" berada di +X
  static addBedrockCube(out, c, pivot, tw, th) {
    const inf = c.inflate || 0;
    const [ox, oy, oz] = c.origin;
    const [w, h, d] = c.size;
    const [px, py, pz] = pivot;
    this.addBox(
      out,
      -(ox + w + inf - px) * PX, (oy - inf - py) * PX, (oz - inf - pz) * PX,
      -(ox - inf - px) * PX, (oy + h + inf - py) * PX, (oz + d + inf - pz) * PX,
      c.uv[0], c.uv[1], w, h, d, tw, th
    );
  }

  static addBox(out, x0, y0, z0, x1, y1, z1, u, v, w, h, d, tw, th) {
    // [normal, 4 titik (kiri-bawah, kanan-bawah, kanan-atas, kiri-atas dari luar), u, v, lebar, tinggi]
    const faces = [
      [[0, 0, -1], [x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], u + d, v + d, w, h],
      [[0, 0, 1], [x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], u + 2 * d + w, v + d, w, h],
      [[1, 0, 0], [x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1], u, v + d, d, h],
      [[-1, 0, 0], [x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0], u + d + w, v + d, d, h],
      [[0, 1, 0], [x1, y1, z0, x0, y1, z0, x0, y1, z1, x1, y1, z1], u + d, v, w, d],
      [[0, -1, 0], [x1, y0, z1, x0, y0, z1, x0, y0, z0, x1, y0, z0], u + d + w, v, w, d]
    ];
    for (const [n, p, fu, fv, fw, fh] of faces) {
      this.addQuad(out, n, p, fu / tw, fv / th, fw / tw, fh / th);
    }
  }

  static addQuad(out, n, p, u0, v0, uw, vh) {
    const uv = [u0, v0 + vh, u0 + uw, v0 + vh, u0 + uw, v0, u0, v0];
    for (const i of [0, 1, 2, 0, 2, 3]) {
      out.pos.push(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
      out.norm.push(n[0], n[1], n[2]);
      out.uvs.push(uv[i * 2], uv[i * 2 + 1]);
    }
  }

  static finish(out) {
    return {
      positions: new Float32Array(out.pos),
      uvs: new Float32Array(out.uvs),
      normals: new Float32Array(out.norm)
    };
  }
}

return { BoxBuilder };
})();
const msrc_features_player_model_bone_mesh_js = (() => {
const { BoxBuilder } = msrc_features_player_model_box_builder_js;

const ZERO = [0, 0, 0];

// Mesh dari satu/beberapa bone Bedrock. relativeToPivot=true membuat koordinat
// relatif pivot bone (untuk bagian yang berputar: kepala, lengan).
class BoneMesh {
  static build(geoJson, boneNames, relativeToPivot) {
    const geo = geoJson["minecraft:geometry"][0];
    const tw = geo.description.texture_width || 64;
    const th = geo.description.texture_height || 64;
    const out = BoxBuilder.create();
    let count = 0;

    geo.bones
      .filter(b => boneNames.includes(b.name) && b.cubes)
      .forEach(b => {
        const pivot = relativeToPivot && b.pivot ? b.pivot : ZERO;
        b.cubes.forEach(c => {
          BoxBuilder.addBedrockCube(out, c, pivot, tw, th);
          count++;
        });
      });
    return count ? BoxBuilder.finish(out) : null;
  }
}

return { BoneMesh };
})();
const msrc_features_player_model_cape_mesh_js = (() => {
const { BoxBuilder } = msrc_features_player_model_box_builder_js;
const { PX } = msrc_features_player_model_model_const_js;

class CapeMesh {
  static build() {
    const out = BoxBuilder.create();
    // Kotak jubah Minecraft 10x16x1 piksel, tepi atas di y=0, tekstur 64x32
    BoxBuilder.addBox(out, -5 * PX, -16 * PX, -1 * PX, 5 * PX, 0, 0, 0, 0, 10, 16, 1, 64, 32);
    const mesh = BoxBuilder.finish(out);

    // Putar 180 derajat sumbu Y: sisi logo menghadap keluar dari punggung pemain
    for (const arr of [mesh.positions, mesh.normals]) {
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] = -arr[i];
        arr[i + 2] = -arr[i + 2];
      }
    }
    return mesh;
  }
}

return { CapeMesh };
})();
const msrc_features_player_model_body_helper_js = (() => {
const DEG = Math.PI / 180;
const TWO_PI = Math.PI * 2;
const MAX_NECK_TURN = 75 * DEG;   // batas putar leher Minecraft
const DRAG_THRESHOLD = 50 * DEG;  // di atas ini badan ikut terseret
const TICK_MS = 50;               // 1 tick Minecraft = 50 ms

// Perilaku yaw badan ala Minecraft: badan diam selama kepala menoleh
// <= 75 derajat, selebihnya badan terseret. Tidak tergantung FPS.
class BodyHelper {
  constructor() {
    this.bodyYaw = 0;
  }

  static wrapAngle(angle) {
    return angle - TWO_PI * Math.floor((angle + Math.PI) / TWO_PI);
  }

  // follow = true (memukul/bergerak): badan menyusul arah kepala 30% per tick seperti Minecraft
  update(headYaw, dtMs, follow = false) {
    if (follow) {
      const d = BodyHelper.wrapAngle(headYaw - this.bodyYaw);
      this.bodyYaw += d * (1 - Math.pow(0.7, dtMs / TICK_MS));
    }
    let delta = BodyHelper.wrapAngle(headYaw - this.bodyYaw);
    if (delta > MAX_NECK_TURN) delta = MAX_NECK_TURN;
    else if (delta < -MAX_NECK_TURN) delta = -MAX_NECK_TURN;
    this.bodyYaw = headYaw - delta;

    if (Math.abs(delta) > DRAG_THRESHOLD) {
      this.bodyYaw += delta * (1 - Math.pow(0.8, dtMs / TICK_MS));
    }
    return this.bodyYaw;
  }

  getYaw() {
    return this.bodyYaw;
  }
}

return { BodyHelper };
})();
const msrc_features_player_animation_sneak_pose_js = (() => {
const { Mat4 } = msrc_core_math_mat4_js;
const { PX, NECK_Y } = msrc_features_player_model_model_const_js;

const v = [0, 0, 0];

// Pose jongkok Minecraft Java (HumanoidModel crouching), faktor 0..1 (1 = jongkok penuh):
// badan turun 3,2 px lalu miring 0,5 rad di leher, kepala turun 4,2 px, lengan +0,4 rad,
// seluruh model turun 2 px (PlayerRenderer.getRenderOffset). Kaki: lihat leg-pose.js.
class SneakPose {
  static DROP = 3.2 * PX;
  static HEAD_DROP = 4.2 * PX;
  static ARM_TILT = 0.4; // tambahan ayunan lengan (rad)
  static MODEL_DROP = 0.125;  // blok
  static CAPE_DROP = 1.85 * PX;
  static CAPE_BACK = 1.4 * PX;
  static CAPE_TILT = 25 * Math.PI / 180;

  // Jubah (PlayerModel cloak y 1,85 z 1,4 + CapeLayer +25 derajat): offset pivot dan sudut tambahan
  static capeOffset(out, s) {
    out[0] = 0; out[1] = -SneakPose.CAPE_DROP * s; out[2] = SneakPose.CAPE_BACK * s;
    return out;
  }

  // Badan: turun lalu miring di leher
  static lean(m, s) {
    v[0] = 0; v[1] = -SneakPose.DROP * s; v[2] = 0;
    Mat4.translate(m, m, v);
    v[1] = NECK_Y;
    Mat4.translate(m, m, v);
    Mat4.rotateX(m, m, -0.5 * s);
    v[1] = -NECK_Y;
    Mat4.translate(m, m, v);
  }
}

return { SneakPose };
})();
const msrc_features_player_animation_arm_pose_js = (() => {
const { Mat4 } = msrc_core_math_mat4_js;
const { PX } = msrc_features_player_model_model_const_js;
const { SneakPose } = msrc_features_player_animation_sneak_pose_js;

const TWO_PI = Math.PI * 2;
const SHOULDER_Y = 22 * PX;
const SHOULDER_X = 5 * PX;
const pos = [0, 0, 0];

function reset(m) {
  for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
  return m;
}

// Port HumanoidModel.setupAttackAnim + AnimationUtils.bobModelPart (Minecraft Java).
// Sudut Java dikonversi ke ruang kita (Y atas, menghadap -Z): z tetap, x dan y dibalik.
class ArmPose {
  // Mengisi m.rightArm & m.leftArm, mengembalikan putaran badan (twist) saat memukul
  static update(m, anim, headPitch, bodyYaw, sneak = 0) {
    const t = anim.swingProgress;
    const age = anim.age;
    const twist = t > 0 ? Math.sin(Math.sqrt(t) * TWO_PI) * 0.2 : 0;

    // Napas idle: lengan bergoyang pelan
    const bobZ = Math.cos(age * 0.09) * 0.05 + 0.05;
    const bobX = Math.sin(age * 0.067) * 0.05;

    let f = 1 - t;
    f *= f;
    f *= f;
    f = 1 - f;
    const f1 = Math.sin(f * Math.PI);
    const f2 = Math.sin(t * Math.PI) * -(headPitch - 0.7) * 0.75;

    const tilt = SneakPose.ARM_TILT * sneak; // jongkok: lengan ikut condong
    const drop = SneakPose.DROP * sneak;
    // Ayunan jalan (Java): kanan = -cos, kiri = +cos, amplitudo = limbSpeed
    const walk = Math.cos(anim.limbPos * 0.6662) * anim.limbSpeed;
    const rx = bobX - (f1 * 1.2 + f2) + tilt - walk;
    const rz = bobZ + Math.sin(t * Math.PI) * -0.4;
    ArmPose.place(m.rightArm, bodyYaw, twist, 1, rx, twist * 3, rz, drop);
    ArmPose.place(m.leftArm, bodyYaw, twist, -1, twist - bobX + tilt + walk, twist, -bobZ, drop);
    return twist;
  }

  // side: +1 lengan kanan (+X), -1 lengan kiri (-X)
  static place(out, bodyYaw, twist, side, rx, ry, rz, drop = 0) {
    reset(out);
    Mat4.rotateY(out, out, -bodyYaw);
    pos[0] = side * Math.cos(twist) * SHOULDER_X;
    pos[1] = SHOULDER_Y - drop;
    pos[2] = side * Math.sin(twist) * SHOULDER_X;
    Mat4.translate(out, out, pos);
    Mat4.rotateZ(out, out, rz);
    Mat4.rotateY(out, out, -ry);
    Mat4.rotateX(out, out, -rx);
  }
}

return { ArmPose };
})();
const msrc_features_player_animation_leg_pose_js = (() => {
const { Mat4 } = msrc_core_math_mat4_js;
const { PX } = msrc_features_player_model_model_const_js;

const HIP_X = 1.9 * PX;
const HIP_Y = 12 * PX;
const CROUCH_Z = 3.9 * PX; // kaki bergeser ke belakang saat jongkok (Java: z 0,1 -> 4)
const pos = [0, 0, 0];

function reset(m) {
  for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
  return m;
}

// Port HumanoidModel.setupAnim untuk kaki: kaki kanan dan kiri berayun berlawanan fase.
class LegPose {
  static update(m, bodyYaw, limbPos, limbSpeed, sneak) {
    const swing = Math.cos(limbPos * 0.6662) * 1.4 * limbSpeed;
    LegPose.place(m.rightLeg, bodyYaw, 1, swing, sneak);
    LegPose.place(m.leftLeg, bodyYaw, -1, -swing, sneak);
  }

  // side: +1 kaki kanan (+X), -1 kaki kiri (-X); xRot dalam konvensi Java
  static place(out, bodyYaw, side, xRot, sneak) {
    reset(out);
    Mat4.rotateY(out, out, -bodyYaw);
    pos[0] = side * HIP_X; pos[1] = HIP_Y; pos[2] = CROUCH_Z * sneak;
    Mat4.translate(out, out, pos);
    Mat4.rotateX(out, out, -xRot);
  }
}

return { LegPose };
})();
const msrc_features_player_player_pose_js = (() => {
const { Mat4 } = msrc_core_math_mat4_js;
const { ArmPose } = msrc_features_player_animation_arm_pose_js;
const { SneakPose } = msrc_features_player_animation_sneak_pose_js;
const { LegPose } = msrc_features_player_animation_leg_pose_js;
const { NECK_Y, BODY_BACK_Z } = msrc_features_player_model_model_const_js;

const DEG = Math.PI / 180;
const TWO_PI = Math.PI * 2;
const ORIGIN = [0, 0, 0];
const REST_CAPE = { pitch: 6, roll: 0 };
const CAPE_PIVOT = [0, NECK_Y, BODY_BACK_Z];
const PARTS = ["rightLeg", "leftLeg", "body", "head", "cape", "rightArm", "leftArm"];

function reset(m) {
  for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
  return m;
}

// Menghitung matriks model (dunia) dan modelView tiap bagian tanpa alokasi per frame.
// Matriks model dipakai untuk pencahayaan world-space, modelView untuk posisi layar.
class PlayerPose {
  constructor() {
    this.model = {};
    this.modelView = {};
    for (let i = 0; i < PARTS.length; i++) {
      this.model[PARTS[i]] = Mat4.create();
      this.modelView[PARTS[i]] = Mat4.create();
    }
    this.hand = Mat4.create();
    this.base = Mat4.create(); // view * translasi posisi pemain
    this.neck = [0, NECK_Y, 0];
    this.vec = [0, 0, 0];
    this.capeVec = [0, 0, 0];
    this.origin = [0, 0, 0];
  }

  // sneak: 0..1 (jongkok), pos: posisi kaki pemain di dunia
  // cape: CapePhysics (pitch/roll derajat); tanpa itu jubah menggantung diam 6 derajat
  update(camera, bodyYaw, anim, sneak = 0, pos = ORIGIN, cape = REST_CAPE) {
    const m = this.model;
    const twist = ArmPose.update(m, anim, camera.pitch, bodyYaw, sneak);

    LegPose.update(m, bodyYaw, anim.limbPos, anim.limbSpeed, sneak);
    Mat4.rotateY(reset(m.body), m.body, -bodyYaw - twist);
    SneakPose.lean(m.body, sneak);

    // Kepala menoleh mengikuti kamera; pitch positif = menunduk
    this.neck[1] = NECK_Y - SneakPose.HEAD_DROP * sneak;
    Mat4.translate(reset(m.head), m.head, this.neck);
    Mat4.rotateY(m.head, m.head, -camera.yaw);
    Mat4.rotateX(m.head, m.head, -camera.pitch);

    Mat4.rotateY(reset(m.cape), m.cape, -bodyYaw - twist);
    Mat4.translate(m.cape, m.cape, CAPE_PIVOT);
    Mat4.translate(m.cape, m.cape, SneakPose.capeOffset(this.capeVec, sneak));
    // pitch positif = ujung bawah jubah terangkat ke belakang (+Z)
    Mat4.rotateX(m.cape, m.cape, -cape.pitch * DEG - SneakPose.CAPE_TILT * sneak);
    Mat4.rotateZ(m.cape, m.cape, cape.roll * DEG);

    Mat4.copy(this.base, camera.viewMatrix);
    const o = this.origin; // seluruh model turun 0,125 blok saat jongkok
    o[0] = pos[0]; o[1] = pos[1] - SneakPose.MODEL_DROP * sneak; o[2] = pos[2];
    Mat4.translate(this.base, this.base, o);
    for (let i = 0; i < PARTS.length; i++) {
      const k = PARTS[i];
      Mat4.multiply(this.modelView[k], this.base, m[k]);
    }
  }

  // Tangan orang pertama (ItemInHandRenderer.renderPlayerArm), progress ayunan 0..1
  updateHand(t) {
    const mv = reset(this.hand);
    const v = this.vec;
    const sq = Math.sqrt(t);
    v[0] = 0.64 - 0.3 * Math.sin(sq * Math.PI);
    v[1] = -0.6 + 0.4 * Math.sin(sq * TWO_PI);
    v[2] = -0.72 - 0.4 * Math.sin(t * Math.PI);
    Mat4.translate(mv, mv, v);
    Mat4.rotateY(mv, mv, 45 * DEG);
    Mat4.rotateY(mv, mv, Math.sin(sq * Math.PI) * 70 * DEG);
    Mat4.rotateZ(mv, mv, Math.sin(t * t * Math.PI) * -20 * DEG);

    v[0] = -1.0; v[1] = 3.6; v[2] = 3.5;
    Mat4.translate(mv, mv, v);
    Mat4.rotateZ(mv, mv, 120 * DEG);
    Mat4.rotateX(mv, mv, 200 * DEG);
    Mat4.rotateY(mv, mv, -135 * DEG);
    v[0] = 5.6; v[1] = 0; v[2] = 0;
    Mat4.translate(mv, mv, v);
    v[0] = -0.3125; v[1] = 0.125; v[2] = 0;
    Mat4.translate(mv, mv, v);
    return mv;
  }
}

return { PlayerPose };
})();
const msrc_features_player_animation_swing_anim_js = (() => {
const SWING_MS = 300;        // 6 tick Minecraft
const RESTART_AT = 0.5;      // saat menghancurkan, ayunan baru dimulai setelah separuh jalan
const RESTART_OFFSET = -1 / 6;

// Progress ayunan 0..1 seperti attackAnim Minecraft
class SwingAnim {
  constructor() {
    this.t = 0;
    this.active = false;
  }

  // Aman dipanggil tiap frame (mis. saat menghancurkan)
  swing() {
    if (!this.active) {
      this.t = 0;
      this.active = true;
    } else if (this.t >= RESTART_AT) {
      this.t = RESTART_OFFSET;
    }
  }

  update(dtMs) {
    if (!this.active) return;
    this.t += dtMs / SWING_MS;
    if (this.t >= 1) {
      this.t = 0;
      this.active = false;
    }
  }

  get progress() {
    return this.active && this.t > 0 ? this.t : 0;
  }
}

return { SwingAnim };
})();
const msrc_features_player_animation_limb_swing_js = (() => {
const TICK_MS = 50;

// Ayunan anggota badan saat berjalan (LivingEntity.calculateEntityAnimation + WalkAnimationState).
// speed = amplitudo 0..1 (halus), pos = fase gelombang. Berbasis waktu, tidak tergantung FPS.
class LimbSwing {
  constructor() {
    this.pos = 0;
    this.speed = 0;
  }

  // distBlocks = jarak horizontal yang ditempuh selama dtMs
  update(distBlocks, dtMs) {
    if (dtMs <= 0) return;
    const ticks = dtMs / TICK_MS;
    const target = Math.min((distBlocks / ticks) * 4, 1);
    this.speed += (target - this.speed) * (1 - Math.pow(0.6, ticks));
    this.pos += this.speed * ticks;
  }
}

return { LimbSwing };
})();
const msrc_features_player_animation_player_animator_js = (() => {
const { SwingAnim } = msrc_features_player_animation_swing_anim_js;
const { LimbSwing } = msrc_features_player_animation_limb_swing_js;

const TICK_MS = 50;

// Status animasi pemain. Sumber aksi (sentuh sekarang, entity/blok nanti)
// cukup mengimplementasikan consumeAttack() dan isMining().
class PlayerAnimator {
  constructor() {
    this.swing = new SwingAnim();
    this.limb = new LimbSwing();
    this.ageMs = 0;
  }

  // moveDist: jarak horizontal yang ditempuh pemain selama dtMs (untuk ayunan jalan)
  update(dtMs, actions, moveDist = 0) {
    this.ageMs += dtMs;
    this.limb.update(moveDist, dtMs);
    if (actions) {
      if (actions.consumeAttack()) this.swing.swing();
      if (actions.isMining()) this.swing.swing();
    }
    this.swing.update(dtMs);
  }

  // ageInTicks Minecraft (dipakai napas idle)
  get age() {
    return this.ageMs / TICK_MS;
  }

  get limbPos() {
    return this.limb.pos;
  }

  get limbSpeed() {
    return this.limb.speed;
  }

  get swinging() {
    return this.swing.active;
  }

  get swingProgress() {
    return this.swing.progress;
  }
}

return { PlayerAnimator };
})();
const msrc_features_player_animation_cape_physics_js = (() => {
const DEG = Math.PI / 180;
const TICK_MS = 50;
const CHASE = 0.25;          // jubah mengejar pemain 25% per tick (Player.moveCloak)
const TELEPORT = 10;

function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

// Fisika jubah ala Minecraft Java (Player.moveCloak + CapeLayer). Jubah tertinggal di belakang
// posisi pemain; selisihnya menentukan seberapa jauh jubah terangkat (pitch) dan miring (roll).
// Hasil: pitch (derajat, sudah termasuk 6 derajat dasar), roll (derajat).
class CapePhysics {
  constructor() {
    this.c = [0, 0, 0];
    this.init = false;
    this.pitch = 6;
    this.roll = 0;
  }

  // pos = posisi kaki pemain, bodyYaw dalam radian (konvensi kamera kita), walkDist/bob dari PlayerState
  update(pos, bodyYaw, walkDist, bob, dtMs) {
    const c = this.c;
    if (!this.init || Math.abs(pos[0] - c[0]) > TELEPORT || Math.abs(pos[2] - c[2]) > TELEPORT) {
      c[0] = pos[0]; c[1] = pos[1]; c[2] = pos[2];
      this.init = true;
    }
    const k = 1 - Math.pow(1 - CHASE, dtMs / TICK_MS);
    c[0] += (pos[0] - c[0]) * k;
    c[1] += (pos[1] - c[1]) * k;
    c[2] += (pos[2] - c[2]) * k;

    const dx = c[0] - pos[0], dy = c[1] - pos[1], dz = c[2] - pos[2];
    const sn = Math.sin(bodyYaw), cs = Math.cos(bodyYaw);
    // maju badan = (sin, -cos), kanan badan = (cos, sin)
    const back = clamp(-(dx * sn - dz * cs) * 100, 0, 150);
    const side = clamp((dx * cs + dz * sn) * 100, -20, 20);
    let lift = clamp(dy * 10, -6, 32);
    lift += Math.sin(walkDist * 6) * 32 * bob;

    this.pitch = 6 + back / 2 + lift;
    this.roll = side / 2;
  }
}

return { CapePhysics };
})();
const msrc_features_player_player_renderer_js = (() => {
const { Assets } = msrc_core_assets_js;
const { ShaderProgram } = msrc_shaders_RenderVulkan_shader_program_js;
const { ShaderPack } = msrc_shaders_shader_pack_js;
const { TextureLoader } = msrc_shaders_RenderVulkan_texture_loader_js;
const { MeshVao } = msrc_shaders_RenderVulkan_mesh_vao_js;
const { GeoParser } = msrc_features_player_model_geo_parser_js;
const { BoneMesh } = msrc_features_player_model_bone_mesh_js;
const { CapeMesh } = msrc_features_player_model_cape_mesh_js;
const { BodyHelper } = msrc_features_player_model_body_helper_js;
const { PlayerPose } = msrc_features_player_player_pose_js;
const { PlayerAnimator } = msrc_features_player_animation_player_animator_js;
const { CapePhysics } = msrc_features_player_animation_cape_physics_js;
const { PerspectiveMode } = msrc_features_camera_camera_js;
const { Mat4 } = msrc_core_math_mat4_js;
const { Options } = msrc_core_options_options_js;

// [nama bone, relatif pivot?] - bagian yang bergerak dipisah agar bisa dianimasikan
const BONES = {
  body: [["Body"], false],
  rightLeg: [["Right Leg"], true],
  leftLeg: [["Left Leg"], true],
  rightArm: [["Right Arm"], true],
  leftArm: [["Left Arm"], true],
  head: [["Head"], true]
};

class PlayerRenderer {
  // opt: hasil Options.load() (skinPath, capePath); tanpa itu memakai default
  constructor(glContext, opt = Options.defaults()) {
    this.gl = glContext.getGL();
    this.opt = opt;
    this.program = null;
    this.u = null;
    this.meshes = {};
    this.skinTex = null;
    this.capeTex = null;
    this.bodyHelper = new BodyHelper();
    this.pose = new PlayerPose();
    this.animator = new PlayerAnimator();
    this.cape = new CapePhysics();
    this.handTmp = Mat4.create();
    this.lastTime = performance.now();
    this.disposed = false;
    this.init();
  }

  init() {
    const gl = this.gl;
    this.program = ShaderPack.create(gl, "player");
    // Lokasi uniform di-cache sekali, bukan dicari setiap frame
    this.u = {
      proj: gl.getUniformLocation(this.program, "u_projection"),
      mv: gl.getUniformLocation(this.program, "u_modelView"),
      nm: gl.getUniformLocation(this.program, "u_normalMatrix"),
      tex: gl.getUniformLocation(this.program, "u_texture")
    };
    gl.useProgram(this.program);
    gl.uniform1i(this.u.tex, 0);

    const def = Options.defaults(); // skin/jubah cadangan bila file pilihan gagal dimuat
    this.skinTex = TextureLoader.load(gl, this.opt.skinPath, def.skinPath);
    this.capeTex = this.opt.capePath ? TextureLoader.load(gl, this.opt.capePath, def.capePath) : null;
    this.meshes.cape = MeshVao.create(gl, CapeMesh.build());
    this.loadGeometry();
  }

  async loadGeometry() {
    try {
      const res = await Assets.fetch("assets/models/entity/player/wide.geo.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const geo = await res.json();
      if (this.disposed) return;
      const gl = this.gl, m = this.meshes;
      m.arm = MeshVao.create(gl, GeoParser.extractBoneCubes(geo, "Right Arm"));
      for (const key of Object.keys(BONES)) {
        const [names, rel] = BONES[key];
        m[key] = MeshVao.create(gl, BoneMesh.build(geo, names, rel));
      }
    } catch (err) {
      console.warn("[PlayerRenderer] Model pemain gagal dimuat:", err);
    }
  }

  draw(mesh, tex, mv, nm) {
    if (!mesh || !tex) return; // tex null = bagian tidak dipakai (mis. tanpa jubah)
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniformMatrix4fv(this.u.mv, false, mv);
    gl.uniformMatrix4fv(this.u.nm, false, nm);
    MeshVao.draw(gl, mesh);
  }

  // actions (opsional): objek dengan consumeAttack() dan isMining()
  // state (opsional): PlayerState (pos, vel, crouch, moving, bob)
  render(camera, actions, state = null) {
    if (!this.program) return;
    const gl = this.gl;
    const now = performance.now();
    const dt = Math.min(now - this.lastTime, 100);
    this.lastTime = now;
    const dist = state ? Math.hypot(state.vel[0], state.vel[2]) * dt / 1000 : 0;
    this.animator.update(dt, actions, dist);
    // Badan selalu diperbarui, termasuk saat orang pertama, seperti Minecraft
    // Memukul atau bergerak: badan menyusul arah kepala
    const follow = this.animator.swinging || (state !== null && state.moving);
    const bodyYaw = this.bodyHelper.update(camera.yaw, dt, follow);
    if (state) this.cape.update(state.pos, bodyYaw, state.walkDist, state.bobAmt, dt);
    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniformMatrix4fv(this.u.proj, false, camera.projMatrix);

    const mesh = this.meshes, skin = this.skinTex;
    if (camera.mode === PerspectiveMode.FIRST_PERSON) {
      let h = this.pose.updateHand(this.animator.swingProgress);
      if (state) { // tangan ikut view bobbing
        Mat4.multiply(this.handTmp, state.bob, h);
        h = this.handTmp;
      }
      this.draw(mesh.arm, skin, h, h);
    } else {
      this.pose.update(camera, bodyYaw, this.animator, state && state.crouch ? 1 : 0, state ? state.pos : undefined, this.cape);
      const m = this.pose.model, mv = this.pose.modelView;
      this.draw(mesh.rightLeg, skin, mv.rightLeg, m.rightLeg);
      this.draw(mesh.leftLeg, skin, mv.leftLeg, m.leftLeg);
      this.draw(mesh.body, skin, mv.body, m.body);
      this.draw(mesh.rightArm, skin, mv.rightArm, m.rightArm);
      this.draw(mesh.leftArm, skin, mv.leftArm, m.leftArm);
      this.draw(mesh.cape, this.capeTex, mv.cape, m.cape);
      this.draw(mesh.head, skin, mv.head, m.head);
    }
    gl.bindVertexArray(null);
  }

  dispose() {
    this.disposed = true;
    const gl = this.gl;
    if (gl) {
      Object.values(this.meshes).forEach(m => MeshVao.dispose(gl, m));
      TextureLoader.dispose(gl, this.skinTex);
      TextureLoader.dispose(gl, this.capeTex);
      ShaderProgram.dispose(gl, this.program);
    }
    this.meshes = {};
    this.program = null;
    this.gl = null;
  }
}

return { PlayerRenderer };
})();
const msrc_features_movement_move_input_js = (() => {
// Status input gerak. Diisi oleh UI sentuh (atau sumber lain), dibaca oleh fisika.
class MoveInput {
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

return { MoveInput };
})();
const msrc_features_movement_config_js = (() => {
// Semua angka gerakan ada di sini agar mudah diubah/dimodifikasi tanpa menyentuh logika.
const MoveConfig = Object.freeze({
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

return { MoveConfig };
})();
const msrc_features_movement_player_state_js = (() => {
const { Mat4 } = msrc_core_math_mat4_js;
const { MoveConfig } = msrc_features_movement_config_js;

// Data gerak pemain (tanpa logika). Dibaca kamera, renderer, dan gerbang aksi.
class PlayerState {
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

return { PlayerState };
})();
const msrc_features_movement_physics_js = (() => {
const { MoveConfig: C } = msrc_features_movement_config_js;

const EPS = 1e-4;
const noGround = () => 0;

// Fisika pemain berbasis waktu (bukan per frame): jalan, jongkok, lompat, terbang.
// getGround(x, y, z) -> tinggi permukaan tempat berpijak; world nanti cukup menyuplai fungsi ini.
class PlayerPhysics {
  constructor(getGround = noGround) {
    this.getGround = getGround;
    this.prevForward = false;
  }

  update(s, input, yaw, dtMs) {
    const dt = dtMs / 1000;
    const v = s.vel;
    if (input.consumeFlyToggle()) {
      s.flying = !s.flying;
      v[1] = 0;
      if (s.flying) input.sneak = false; // sneak yang masih aktif akan langsung menurunkan pemain
    }
    s.sneaking = input.sneak;

    // Lari berhenti saat tombol maju dilepas atau jongkok (kecuali sedang terbang)
    if (input.sprint && ((this.prevForward && !input.forward) || (input.sneak && !s.flying))) input.sprint = false;
    this.prevForward = input.forward;
    s.sprinting = input.sprint && input.forward;

    // Arah input -> arah dunia (maju = (sin yaw, -cos yaw), kanan = (cos yaw, sin yaw))
    let ax = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let az = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
    const len = Math.hypot(ax, az);
    if (len > 0) { ax /= len; az /= len; }
    const sn = Math.sin(yaw), cs = Math.cos(yaw);
    const sp = s.sprinting;
    const speed = s.flying ? C.flySpeed * (sp ? C.flySprintMul : 1)
      : (s.sneaking ? C.sneakSpeed : C.walkSpeed * (sp ? C.sprintMul : 1));
    const tx = (cs * ax + sn * az) * speed;
    const tz = (sn * ax - cs * az) * speed;

    const k = s.flying ? 1 - Math.pow(C.flyDamp, dt)
      : (s.onGround ? 1 : 1 - Math.pow(C.airDamp, dt));
    v[0] += (tx - v[0]) * k;
    v[2] += (tz - v[2]) * k;

    if (s.flying) {
      const ty = (input.jump ? C.flyUpSpeed : 0) - (s.sneaking ? C.flyDownSpeed : 0);
      v[1] += (ty - v[1]) * (1 - Math.pow(C.flyDamp, dt));
    } else {
      if (s.onGround && input.jump) v[1] = C.jumpSpeed;
      v[1] = Math.max(v[1] - C.gravity * dt, -C.terminalSpeed);
    }

    const p = s.pos;
    p[0] += v[0] * dt; p[1] += v[1] * dt; p[2] += v[2] * dt;

    const gy = this.getGround(p[0], p[1], p[2]);
    if (p[1] <= gy) {
      p[1] = gy;
      if (v[1] < 0 || !s.flying) { v[1] = 0; s.flying = false; } // mendarat = berhenti terbang
    }
    s.onGround = !s.flying && p[1] <= gy + EPS;
    s.moving = len > 0;

    // Tinggi mata jongkok halus (setengah jalan tiap 50 ms); pose model berganti seketika seperti Java
    s.crouch = s.sneaking && !s.flying;
    const target = s.crouch ? 1 : 0;
    s.sneakAmt += (target - s.sneakAmt) * (1 - Math.pow(0.5, dtMs / 50));
    s.eye = C.eyeHeight - C.sneakEyeDrop * s.sneakAmt;
  }
}

return { PlayerPhysics };
})();
const msrc_features_movement_view_bob_js = (() => {
const { Mat4 } = msrc_core_math_mat4_js;

const DEG = Math.PI / 180;
const TICK_MS = 50;
const MAX_BOB = 0.1;
const STEP_SCALE = 0.6;
const vec = [0, 0, 0];

// Port GameRenderer.bobView (Minecraft Java). Hasilnya matriks di ruang kamera
// yang dikalikan ke view orang pertama dan ke matriks tangan.
class ViewBob {
  static update(s, dtMs) {
    const p = s.vel;
    const dist = Math.hypot(p[0], p[2]) * dtMs / 1000;       // jarak horizontal frame ini
    s.walkDist += dist * STEP_SCALE;

    const perTick = dtMs > 0 ? dist * TICK_MS / dtMs : 0;
    const target = s.onGround ? Math.min(MAX_BOB, perTick) : 0;
    s.bobAmt += (target - s.bobAmt) * (1 - Math.pow(0.6, dtMs / TICK_MS));

    const f = -s.walkDist * Math.PI;
    const b = s.bobAmt;
    const m = s.bob;
    for (let i = 0; i < 16; i++) m[i] = (i % 5 === 0) ? 1 : 0;
    vec[0] = Math.sin(f) * b * 0.5;
    vec[1] = -Math.abs(Math.cos(f) * b);
    Mat4.translate(m, m, vec);
    Mat4.rotateZ(m, m, Math.sin(f) * b * 3 * DEG);
    Mat4.rotateX(m, m, Math.abs(Math.cos(f - 0.2) * b) * 5 * DEG);
  }
}

return { ViewBob };
})();
const msrc_features_movement_air_gate_js = (() => {
const { MoveConfig } = msrc_features_movement_config_js;

// Pembungkus sumber aksi (TouchAction): tahan memukul dimatikan saat di udara,
// tap menyerang tetap berfungsi. Sumber asli tidak perlu tahu soal fisika.
class AirborneGate {
  constructor(source, state, allowAir = MoveConfig.mineInAir) {
    this.source = source;
    this.state = state;
    this.allowAir = allowAir;
  }

  consumeAttack() {
    return this.source.consumeAttack();
  }

  // Cincin sentuh disembunyikan saat tahan memukul sedang dimatikan (di udara)
  holdProgress() {
    const p = this.source.holdProgress();
    return (this.allowAir || this.state.onGround) ? p : -1;
  }

  get touchX() { return this.source.startX; }
  get touchY() { return this.source.startY; }

  isMining() {
    const holding = this.source.isMining(); // selalu dipanggil agar status tahan tetap akurat
    return holding && (this.allowAir || this.state.onGround);
  }
}

return { AirborneGate };
})();
const msrc_features_movement_ui_icon_js = (() => {
const { Assets } = msrc_core_assets_js;
const DIR = "assets/control/";

// Satu ikon tombol bertekstur pixel-art (normal / _pressed). Hanya visual, tanpa input.
class Icon {
  constructor(parent, name) {
    this.normal = `url('${Assets.url(DIR + name + ".png")}')`;
    this.down = `url('${Assets.url(DIR + name + "_pressed.png")}')`;
    this.pressed = false;
    // Prapemuatan agar tidak berkedip saat pertama ditekan
    this.preload = new Image();
    this.preload.src = Assets.url(`${DIR}${name}_pressed.png`);

    const el = document.createElement("div");
    el.style.cssText = `position:fixed;background-repeat:no-repeat;background-size:100% 100%;
      image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none;
      -webkit-tap-highlight-color:transparent;z-index:9999;background-image:${this.normal};`;
    parent.appendChild(el);
    this.el = el;
  }

  place(x, y, size) {
    const s = this.el.style;
    s.left = x + "px"; s.top = y + "px";
    s.width = size + "px"; s.height = size + "px";
  }

  setPressed(v) {
    if (v === this.pressed || !this.el) return;
    this.pressed = v;
    this.el.style.backgroundImage = v ? this.down : this.normal;
  }

  dispose() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.preload = null;
    this.el = null;
  }
}

return { Icon };
})();
const msrc_features_movement_ui_dpad_js = (() => {
const { Icon } = msrc_features_movement_ui_icon_js;

// D-pad 3x3: satu area sentuh untuk seluruh grid, jadi jari boleh digeser antar arah
// dan sudut grid = diagonal. Sel tengah dipakai tombol jongkok (di luar kelas ini).
class DPad {
  constructor(parent, input) {
    this.input = input;
    this.touchId = null;
    this.left = 0; this.top = 0; this.cell = 1;
    this.arrows = { up: new Icon(parent, "up"), down: new Icon(parent, "down"),
      left: new Icon(parent, "left"), right: new Icon(parent, "right") };

    this.zone = document.createElement("div");
    this.zone.style.cssText = "position:fixed;z-index:9998;touch-action:none;";
    parent.appendChild(this.zone);

    this.handleStart = (e) => {
      e.preventDefault();
      if (this.touchId !== null) return;
      const t = e.changedTouches[0];
      this.touchId = t.identifier;
      this.apply(t.clientX, t.clientY);
    };
    this.handleMove = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.touchId) this.apply(t.clientX, t.clientY);
      }
    };
    this.handleEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) { this.touchId = null; this.release(); }
      }
    };
    const z = this.zone;
    z.addEventListener("touchstart", this.handleStart, { passive: false });
    z.addEventListener("touchmove", this.handleMove, { passive: false });
    z.addEventListener("touchend", this.handleEnd, { passive: true });
    z.addEventListener("touchcancel", this.handleEnd, { passive: true });
  }

  // x, y = pojok kiri-atas grid, cell = ukuran satu tombol
  layout(x, y, cell) {
    this.left = x; this.top = y; this.cell = cell;
    const s = this.zone.style;
    s.left = x + "px"; s.top = y + "px"; s.width = s.height = cell * 3 + "px";
    const a = this.arrows;
    a.up.place(x + cell, y, cell);
    a.left.place(x, y + cell, cell);
    a.right.place(x + cell * 2, y + cell, cell);
    a.down.place(x + cell, y + cell * 2, cell);
  }

  apply(px, py) {
    const col = Math.min(2, Math.max(0, Math.floor((px - this.left) / this.cell)));
    const row = Math.min(2, Math.max(0, Math.floor((py - this.top) / this.cell)));
    this.set(row === 0, row === 2, col === 0, col === 2);
  }

  release() {
    this.set(false, false, false, false);
  }

  set(f, b, l, r) {
    this.input.setDirs(f, b, l, r);
    const a = this.arrows;
    a.up.setPressed(f); a.down.setPressed(b); a.left.setPressed(l); a.right.setPressed(r);
  }

  dispose() {
    const z = this.zone;
    z.removeEventListener("touchstart", this.handleStart);
    z.removeEventListener("touchmove", this.handleMove);
    z.removeEventListener("touchend", this.handleEnd);
    z.removeEventListener("touchcancel", this.handleEnd);
    if (z.parentNode) z.parentNode.removeChild(z);
    Object.values(this.arrows).forEach(a => a.dispose());
    this.arrows = null;
    this.input = null;
    this.zone = null;
  }
}

return { DPad };
})();
const msrc_features_movement_ui_icon_button_js = (() => {
const { Icon } = msrc_features_movement_ui_icon_js;

// Ikon yang bisa disentuh (multi-touch aman: tiap tombol melacak jarinya sendiri).
// onDown saat jari menyentuh, onUp saat jari diangkat/dibatalkan.
class IconButton extends Icon {
  constructor(parent, name, onDown, onUp) {
    super(parent, name);
    this.touchId = null;
    this.onDown = onDown;
    this.onUp = onUp;
    this.el.style.pointerEvents = "auto";
    this.el.style.touchAction = "none";

    this.handleStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.touchId !== null) return;
      this.touchId = e.changedTouches[0].identifier;
      if (this.onDown) this.onDown();
    };
    this.handleEnd = (e) => {
      if (this.touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.touchId = null;
          if (this.onUp) this.onUp();
          return;
        }
      }
    };
    this.el.addEventListener("touchstart", this.handleStart, { passive: false });
    this.el.addEventListener("touchend", this.handleEnd, { passive: true });
    this.el.addEventListener("touchcancel", this.handleEnd, { passive: true });
  }

  dispose() {
    if (this.el) {
      this.el.removeEventListener("touchstart", this.handleStart);
      this.el.removeEventListener("touchend", this.handleEnd);
      this.el.removeEventListener("touchcancel", this.handleEnd);
    }
    this.onDown = null;
    this.onUp = null;
    super.dispose();
  }
}

return { IconButton };
})();
const msrc_features_movement_ui_move_controls_js = (() => {
const { DPad } = msrc_features_movement_ui_dpad_js;
const { IconButton } = msrc_features_movement_ui_icon_button_js;
const { MoveConfig } = msrc_features_movement_config_js;

// Merangkai kontrol sentuh: d-pad + jongkok (kiri bawah), lompat + terbang + lari (kanan bawah).
// sync(state) dipanggil tiap frame agar tampilan tombol selalu sama dengan status pemain.
class MoveControls {
  constructor(input) {
    this.input = input;
    this.lastJumpTap = -1e9;
    const root = document.body;
    this.dpad = new DPad(root, input);
    this.sneak = new IconButton(root, "sneak", () => { input.sneak = !input.sneak; });
    this.jump = new IconButton(root, "jump", () => this.jumpDown(), () => { input.jump = false; });
    this.fly = new IconButton(root, "fly", () => { input.flyToggle = true; });
    this.sprint = new IconButton(root, "sprint", () => { input.sprint = !input.sprint; });

    this.onResize = () => this.layout();
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("orientationchange", this.onResize, { passive: true });
    this.layout();
  }

  jumpDown() {
    const now = performance.now();
    if (now - this.lastJumpTap < MoveConfig.doubleTapMs) {
      this.input.flyToggle = true; // dua kali tap lompat = terbang
      this.lastJumpTap = -1e9;
    } else {
      this.lastJumpTap = now;
    }
    this.input.jump = true;
  }

  layout() {
    const w = window.innerWidth, h = window.innerHeight;
    const unit = 22 * Math.max(2, Math.floor(Math.min(w, h) / 150)); // kelipatan bulat piksel tekstur
    const m = Math.round(unit * 0.5);
    this.dpad.layout(m, h - m - unit * 3, unit);
    this.sneak.place(m + unit, h - m - unit * 2, unit);
    const big = Math.round(unit * 1.5);
    this.jump.place(w - m - big, h - m - big, big);
    this.sprint.place(w - m - big - unit - Math.round(unit / 4), h - m - unit, unit);
    this.fly.place(w - m - unit - Math.round((big - unit) / 2), h - m - big - unit - Math.round(unit / 4), unit);
  }

  sync(state) {
    this.sneak.setPressed(this.input.sneak);
    this.sprint.setPressed(this.input.sprint);
    this.jump.setPressed(this.input.jump);
    this.fly.setPressed(state.flying);
  }

  dispose() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("orientationchange", this.onResize);
    this.dpad.dispose();
    this.sneak.dispose();
    this.jump.dispose();
    this.fly.dispose();
    this.sprint.dispose();
    this.input = null;
  }
}

return { MoveControls };
})();
const msrc_core_json_js = (() => {
const { Assets } = msrc_core_assets_js;

// Pintu tunggal baca JSON. Tidak pernah melempar: gagal/berkas rusak = peringatan + nilai cadangan.
class Json {
  static async get(path, fallback = null) {
    try {
      const res = await Assets.fetch(path);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.warn(`[Json] ${path} tidak bisa dibaca:`, err.message);
      return fallback;
    }
  }
}

return { Json };
})();
const msrc_features_block_block_registry_js = (() => {
const ID = /^[a-z0-9_]+:[a-z0-9_]+$/;

// Blok udara: id numerik 0, tidak digambar, tidak padat.
const AIR = Object.freeze({
  id: "minecraft:air", ns: "minecraft", name: "air", numId: 0, displayName: "Air", category: "none",
  solid: false, selectable: false, opaque: false, full: false, visible: false,
  model: null, faces: null, carried: null, loot: [], transform: null, lightDampening: 0, renderMethod: "opaque"
});

// Daftar blok: id teks ("minecraft:dirt") <-> id numerik (Uint16 di chunk).
class BlockRegistry {
  constructor() {
    this.list = [AIR];
    this.byName = new Map([[AIR.id, AIR]]);
  }

  // "dirt" + ns -> "ns:dirt"; tidak valid -> null
  static normalizeId(id, ns = "minecraft") {
    if (typeof id !== "string") return null;
    const full = id.includes(":") ? id : `${ns}:${id}`;
    return ID.test(full) ? full : null;
  }

  add(def) {
    if (this.byName.has(def.id)) { console.warn("[Block] id ganda, dilewati:", def.id); return false; }
    if (this.list.length >= 65535) { console.warn("[Block] batas 65535 blok tercapai"); return false; }
    def.numId = this.list.length;
    this.list.push(def);
    this.byName.set(def.id, def);
    return true;
  }

  get(id) { return this.byName.get(id) || null; }
  at(numId) { return this.list[numId] || AIR; }
  idOf(id) { const d = this.byName.get(id); return d ? d.numId : -1; }
  get size() { return this.list.length; }
}

return { AIR, BlockRegistry };
})();
const msrc_features_block_block_def_js = (() => {
const { AIR } = msrc_features_block_block_registry_js;

const FULL_MODEL = Object.freeze({
  full: true,
  cubes: [{ min: [0, 0, 0], max: [1, 1, 1], uv: null }]
});

const title = s => s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Nilai bawaan sebuah blok. Komponen hanya menimpa yang mereka kelola.
// Tanpa komponen collision/selection = padat dan bisa dipilih; tanpa geometry = blok penuh.
class BlockDef {
  static create(id) {
    const [ns, name] = id.split(":");
    return {
      ...AIR, id, ns, name, numId: -1, displayName: title(name), category: "misc",
      solid: true, selectable: true, visible: true, full: true, opaque: true,
      model: FULL_MODEL, faces: null, loot: [], lightDampening: 15
    };
  }

  // Dipanggil sekali setelah semua komponen diterapkan: isi yang kosong, hitung turunan.
  static finish(def) {
    if (!def.faces) { // tanpa tekstur valid -> tekstur "hilang" (slot 0) agar kesalahan terlihat
      const miss = { tex: 0, ov: -1, tintBase: false, tintOv: false };
      def.faces = [miss, miss, miss, miss, miss, miss];
    }
    def.full = def.model.full;
    def.opaque = def.full && def.renderMethod === "opaque";
    return def;
  }
}

return { FULL_MODEL, BlockDef };
})();
const msrc_features_block_components_displayname_js = (() => {
// "displayname": "Grass Block" -> nama yang tampil di UI/inventori
const DisplayName = {
  id: "displayname",
  apply(def, v) {
    const t = typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, "").trim() : "";
    if (!t) throw new Error("harus teks tidak kosong");
    def.displayName = t.slice(0, 48);
  }
};

return { DisplayName };
})();
const msrc_features_block_components_category_js = (() => {
// "category": "nature" -> kelompok di menu kreatif
const Category = {
  id: "category",
  apply(def, v) {
    if (typeof v !== "string" || !/^[a-z_]{1,24}$/.test(v)) throw new Error("kategori a-z/_ maksimal 24 huruf");
    def.category = v;
  }
};

return { Category };
})();
const msrc_features_block_components_collision_js = (() => {
// "collision": false -> bisa ditembus. Tanpa komponen ini = padat (true).
const Collision = {
  id: "collision",
  apply(def, v) {
    if (typeof v !== "boolean") throw new Error("harus true/false");
    def.solid = v;
  }
};

return { Collision };
})();
const msrc_features_block_components_selection_js = (() => {
// "selection": false -> tidak bisa dibidik/dihancurkan. Tanpa komponen ini = true.
const Selection = {
  id: "selection",
  apply(def, v) {
    if (typeof v !== "boolean") throw new Error("harus true/false");
    def.selectable = v;
  }
};

return { Selection };
})();
const msrc_features_block_components_lightdampening_js = (() => {
// "lightdampening": 0..15 -> seberapa banyak cahaya tertahan (15 = penuh). Data untuk sistem cahaya nanti.
const LightDampening = {
  id: "lightdampening",
  apply(def, v) {
    if (!Number.isInteger(v) || v < 0 || v > 15) throw new Error("harus bilangan bulat 0..15");
    def.lightDampening = v;
  }
};

return { LightDampening };
})();
const msrc_features_block_components_geometry_js = (() => {
// "geometry": "full_block" | nama berkas models/block/<nama>.geo.json (boleh "mod:nama")
const Geometry = {
  id: "geometry",
  async apply(def, v, ctx) {
    def.model = await ctx.models.get(v, ctx.ns);
  }
};

return { Geometry };
})();
const msrc_features_block_paths_js = (() => {
const SAFE = /^[\w\-./]+$/;
const ok = s => typeof s === "string" && SAFE.test(s) && !s.includes("..") && !s.startsWith("/");

// Satu-satunya tempat yang tahu letak berkas block. Namespace "minecraft" = assets/, lainnya = mods/<ns>/
class Paths {
  static split(ref, ns) { // "mod:block/x" -> ["mod", "block/x"]; tanpa namespace -> milik pemanggil
    const i = ref.indexOf(":");
    return i < 0 ? [ns, ref] : [ref.slice(0, i), ref.slice(i + 1)];
  }

  static root(ns) { return ns === "minecraft" ? "assets/" : `mods/${ns}/`; }

  static build(ref, ns, folder, ext) {
    if (typeof ref !== "string") return null;
    const [n, p] = this.split(ref, ns);
    return ok(n) && ok(p) ? `${this.root(n)}${folder}${p}${ext}` : null;
  }

  static texture(ref, ns = "minecraft") { return this.build(ref, ns, "textures/", ".png"); }
  static model(ref, ns = "minecraft") { return this.build(ref, ns, "models/block/", ".geo.json"); }
}

return { Paths };
})();
const msrc_core_color_js = (() => {
const HEX = /^#([0-9a-f]{6})$/i;

class Color {
  // "#RRGGBB" -> [r, g, b] 0..1, atau null bila tidak valid
  static hex(str) {
    const m = typeof str === "string" ? HEX.exec(str.trim()) : null;
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
}

return { Color };
})();
const msrc_features_block_components_textures_js = (() => {
const { Paths } = msrc_features_block_paths_js;
const { Color } = msrc_core_color_js;

const RESERVED = new Set(["render_method", "carried"]);
const METHODS = ["opaque", "alpha_test"];
// urutan sisi = DIRS di model-store: up, down, north, south, east, west
const GROUP = [["up", "top"], ["down", "bottom"], ["north", "side"], ["south", "side"], ["east", "side"], ["west", "side"]];

// Satu entri sisi: "block/x" atau { texture, overlay?, tint? }. Path yang sama = satu slot atlas (tanpa duplikat).
function face(raw, ctx) {
  const o = typeof raw === "string" ? { texture: raw } : raw;
  const path = o && Paths.texture(o.texture, ctx.ns);
  if (!path) throw new Error("texture tidak valid: " + (o && o.texture));
  const ovPath = o.overlay ? Paths.texture(o.overlay, ctx.ns) : null;
  if (o.overlay && !ovPath) throw new Error("overlay tidak valid: " + o.overlay);
  const tinted = o.tint === "biome"; // dengan overlay, hanya overlay yang diwarnai (gaya rumput Bedrock)
  return {
    tex: ctx.atlas.require(path), ov: ovPath ? ctx.atlas.require(ovPath) : -1,
    tintBase: tinted && !ovPath, tintOv: tinted && !!ovPath
  };
}

// "textures": { "render_method", "*"|"top"|"bottom"|"side"|"north".."west", "carried" }
// Prioritas sisi: arah spesifik > grup (top/bottom/side) > "*"
const Textures = {
  id: "textures",
  apply(def, v, ctx) {
    if (!v || typeof v !== "object") throw new Error("harus objek");
    if (v.render_method !== undefined) {
      if (!METHODS.includes(v.render_method)) throw new Error("render_method: " + METHODS.join(" | "));
      def.renderMethod = v.render_method;
    }
    const keys = Object.keys(v).filter(k => !RESERVED.has(k));
    if (!keys.length) throw new Error("tidak ada sisi bertekstur");
    const cache = new Map();
    const get = k => { if (!cache.has(k)) cache.set(k, face(v[k], ctx)); return cache.get(k); };
    const pick = (dir, grp) => {
      const k = [dir, grp, "*"].find(key => v[key] !== undefined);
      if (!k) throw new Error(`sisi ${dir} tanpa tekstur`);
      return get(k);
    };
    def.faces = GROUP.map(([dir, grp]) => pick(dir, grp));
    const c = v.carried; // tekstur versi dipegang/inventori (belum digambar; disimpan sebagai data)
    if (c && Paths.texture(c.texture, ctx.ns)) {
      def.carried = { path: Paths.texture(c.texture, ctx.ns), color: Color.hex(c.overlay_color) };
    }
  }
};

return { Textures };
})();
const msrc_features_block_components_loot_js = (() => {
const { BlockRegistry } = msrc_features_block_block_registry_js;

const MAX_ENTRIES = 16;

// "loot": ["minecraft:dirt", { "id": "minecraft:dirt", "count": 2 }] -> yang jatuh saat dihancurkan
const Loot = {
  id: "loot",
  apply(def, v, ctx) {
    if (!Array.isArray(v)) throw new Error("harus daftar");
    def.loot = v.slice(0, MAX_ENTRIES).map(e => {
      const raw = typeof e === "string" ? e : e && e.id;
      const id = BlockRegistry.normalizeId(raw, ctx.ns);
      const count = typeof e === "object" && Number.isInteger(e.count) ? Math.min(64, Math.max(1, e.count)) : 1;
      if (!id) throw new Error("id loot tidak valid: " + raw);
      return { id, count };
    });
  }
};

return { Loot };
})();
const msrc_features_block_components_transforplacetop_js = (() => {
const { BlockRegistry } = msrc_features_block_block_registry_js;

// "transforplacetop": { "to": "minecraft:dirt", "tick": 10 }
// Ada blok diletakkan di atasnya -> setelah <tick> detik berubah menjadi <to>. Dibatalkan bila penutup dibuang.
const TransforPlaceTop = {
  id: "transforplacetop",
  apply(def, v, ctx) {
    const to = v && BlockRegistry.normalizeId(v.to, ctx.ns);
    const sec = v && v.tick;
    if (!to) throw new Error('"to" tidak valid');
    if (typeof sec !== "number" || !(sec >= 0.05 && sec <= 3600)) throw new Error('"tick" (detik) harus 0.05..3600');
    def.transform = { to, seconds: sec };
  }
};

return { TransforPlaceTop };
})();
const msrc_features_block_components_index_js = (() => {
const { DisplayName } = msrc_features_block_components_displayname_js;
const { Category } = msrc_features_block_components_category_js;
const { Collision } = msrc_features_block_components_collision_js;
const { Selection } = msrc_features_block_components_selection_js;
const { LightDampening } = msrc_features_block_components_lightdampening_js;
const { Geometry } = msrc_features_block_components_geometry_js;
const { Textures } = msrc_features_block_components_textures_js;
const { Loot } = msrc_features_block_components_loot_js;
const { TransforPlaceTop } = msrc_features_block_components_transforplacetop_js;

const map = new Map();

// Komponen = { id, apply(def, nilai, ctx) } (boleh async). Satu berkas per komponen.
// Komponen baru: buat berkasnya, tambah satu import + satu entri di daftar bawah (atau Components.register dari mod).
class Components {
  static register(c) {
    if (!c || typeof c.id !== "string" || typeof c.apply !== "function") throw new Error("Komponen block tidak valid");
    map.set(c.id, c);
  }

  static has(id) { return map.has(id); }

  // Komponen rusak/tidak dikenal dilewati (peringatan), blok tetap jadi dengan nilai bawaan.
  static async applyAll(def, components, ctx) {
    for (const [key, value] of Object.entries(components || {})) {
      const c = map.get(key);
      if (!c) { console.warn(`[Block] komponen tidak dikenal "${key}" di ${def.id}`); continue; }
      try { await c.apply(def, value, ctx); }
      catch (err) { console.warn(`[Block] komponen "${key}" di ${def.id} diabaikan: ${err.message}`); }
    }
    return def;
  }
}

[DisplayName, Category, Collision, Selection, LightDampening, Geometry, Textures, Loot, TransforPlaceTop]
  .forEach(c => Components.register(c));

return { Components };
})();
const msrc_features_block_block_loader_js = (() => {
const { Json } = msrc_core_json_js;
const { BlockRegistry } = msrc_features_block_block_registry_js;
const { BlockDef } = msrc_features_block_block_def_js;
const { Components } = msrc_features_block_components_index_js;

// Membangun blok dari JSON: { "identifier": "ns:nama", "components": { ... } }
class BlockLoader {
  // Daftar berkas dibaca dari assets/block/index.json (dibuat otomatis: node tools/index.mjs)
  static async loadAll(registry, ctx) {
    const index = await Json.get("assets/block/index.json", { blocks: [] });
    const files = Array.isArray(index.blocks) ? index.blocks : [];
    const jsons = await Promise.all(files.map(f => Json.get("assets/block/" + f)));
    for (const json of jsons) if (json) await this.register(registry, ctx, json, "minecraft");
  }

  // ns = namespace pemilik (mod memakai id-nya); komponen memakai ns untuk menyelesaikan path/id
  static async register(registry, ctx, json, ns) {
    const id = BlockRegistry.normalizeId(json && json.identifier, ns);
    if (!id || id.split(":")[0] !== ns) { console.warn(`[Block] identifier tidak valid untuk "${ns}":`, json && json.identifier); return false; }
    const def = await Components.applyAll(BlockDef.create(id), json.components, { ...ctx, ns });
    return registry.add(BlockDef.finish(def));
  }
}

return { BlockLoader };
})();
const msrc_features_block_model_store_js = (() => {
const { Json } = msrc_core_json_js;
const { Paths } = msrc_features_block_paths_js;
const { FULL_MODEL } = msrc_features_block_block_def_js;

const DIRS = ["up", "down", "north", "south", "east", "west"];
const MAX_CUBES = 64;
const clamp01 = v => Math.min(1, Math.max(0, v));
const num3 = a => Array.isArray(a) && a.length === 3 && a.every(Number.isFinite);

// uv Bedrock per sisi {uv:[u,v], uv_size:[w,h]} (piksel 16x16) -> pecahan [u0,v0,u1,v1]
function parseUv(face) {
  if (!face || !Array.isArray(face.uv) || !Array.isArray(face.uv_size)) return null;
  const [u, v] = face.uv, [w, h] = face.uv_size;
  return [u / 16, v / 16, (u + w) / 16, (v + h) / 16];
}

// Geometri blok format Bedrock (origin x/z -8..8, y 0..16) -> kubus dalam satuan blok 0..1
function parseGeometry(json) {
  const geo = json && json["minecraft:geometry"] && json["minecraft:geometry"][0];
  if (!geo || !Array.isArray(geo.bones)) throw new Error("geometri tidak valid");
  const cubes = [];
  for (const bone of geo.bones) {
    for (const c of bone.cubes || []) {
      if (!num3(c.origin) || !num3(c.size) || cubes.length >= MAX_CUBES) continue;
      const min = [c.origin[0] / 16 + 0.5, c.origin[1] / 16, c.origin[2] / 16 + 0.5].map(clamp01);
      const max = [min[0] + c.size[0] / 16, min[1] + c.size[1] / 16, min[2] + c.size[2] / 16].map(clamp01);
      const uv = c.uv && typeof c.uv === "object" && !Array.isArray(c.uv)
        ? Object.fromEntries(DIRS.map(d => [d, parseUv(c.uv[d])])) : null;
      cubes.push({ min, max, uv });
    }
  }
  if (!cubes.length) throw new Error("geometri tanpa kubus");
  const f = cubes.length === 1 && cubes[0].min.every(v => v === 0) && cubes[0].max.every(v => v === 1);
  return { full: f, cubes };
}

// Satu berkas geometri dibaca sekali lalu dipakai bersama semua blok (cache per path).
class ModelStore {
  constructor() { this.cache = new Map(); }

  async get(ref, ns) {
    if (typeof ref !== "string") throw new Error("nama geometri harus string");
    if (Paths.split(ref, ns).join(":") === "minecraft:full_block") return FULL_MODEL;
    const path = Paths.model(ref, ns);
    if (!path) throw new Error("nama geometri tidak valid: " + ref);
    if (!this.cache.has(path)) this.cache.set(path, Json.get(path).then(parseGeometry));
    return this.cache.get(path);
  }
}

return { DIRS, parseGeometry, ModelStore };
})();
const msrc_features_block_texture_atlas_js = (() => {
const { TextureLoader } = msrc_shaders_RenderVulkan_texture_loader_js;
const { Assets } = msrc_core_assets_js;

const MAX_SIZE = 4096;
const INSET = 0.02; // setengah-persen piksel: cegah bocor antar tile pada filter NEAREST

const loadImage = url => new Promise(resolve => {
  const img = new Image();
  img.onload = () => { img.onload = img.onerror = null; resolve(img); };
  img.onerror = () => { img.onload = img.onerror = null; console.warn("[Atlas] gagal memuat:", url); resolve(null); };
  img.src = Assets.url(url);
});

// Semua tekstur blok dalam satu atlas (satu bind per frame). Slot 0 = tekstur "hilang" (kotak ungu-hitam).
// Path yang sama hanya mengambil satu slot, jadi tekstur dipakai bersama tidak digandakan.
class TextureAtlas {
  constructor() {
    this.paths = [null];
    this.slots = new Map();
    this.cols = 1;
    this.rects = null;
    this.texture = null;
  }

  require(path) {
    if (this.rects) { console.warn("[Atlas] sudah dibekukan, tekstur ditolak:", path); return 0; }
    let s = this.slots.get(path);
    if (s === undefined) { s = this.paths.length; this.paths.push(path); this.slots.set(path, s); }
    return s;
  }

  // Kunci susunan: setelah ini rect() tetap. Dipanggil sekali setelah semua blok (dan mod) terdaftar.
  freeze() {
    const n = this.paths.length;
    this.cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / this.cols), e = INSET;
    this.rects = this.paths.map((_, i) => {
      const c = i % this.cols, r = Math.floor(i / this.cols);
      return [(c + e / 16) / this.cols, (r + e / 16) / rows, (c + 1 - e / 16) / this.cols, (r + 1 - e / 16) / rows];
    });
    return this;
  }

  rect(slot) { return this.rects[slot] || this.rects[0]; }

  async build(gl) {
    const imgs = await Promise.all(this.paths.map(p => (p ? loadImage(p) : null)));
    const tile = Math.min(Math.max(16, ...imgs.map(i => (i ? i.width : 0))), Math.floor(MAX_SIZE / this.cols));
    const rows = Math.ceil(this.paths.length / this.cols);
    const cv = document.createElement("canvas");
    cv.width = tile * this.cols;
    cv.height = tile * rows;
    const g = cv.getContext("2d");
    g.imageSmoothingEnabled = false;
    imgs.forEach((img, i) => {
      const x = (i % this.cols) * tile, y = Math.floor(i / this.cols) * tile;
      if (img) { g.drawImage(img, x, y, tile, tile); return; }
      g.fillStyle = "#000"; g.fillRect(x, y, tile, tile);
      g.fillStyle = "#f800f8"; g.fillRect(x, y, tile / 2, tile / 2); g.fillRect(x + tile / 2, y + tile / 2, tile / 2, tile / 2);
    });
    this.texture = TextureLoader.fromCanvas(gl, cv, null, false);
    cv.width = cv.height = 0; // lepas memori kanvas; data sudah di GPU
    return this.texture;
  }

  dispose(gl) {
    TextureLoader.dispose(gl, this.texture);
    this.texture = null;
  }
}

return { TextureAtlas };
})();
const msrc_features_mods_mod_loader_js = (() => {
const { Json } = msrc_core_json_js;
const { BlockLoader } = msrc_features_block_block_loader_js;

const SAFE_ID = /^[a-z0-9_]{1,32}$/;
const SAFE_FILE = /^(?!.*\.\.)[\w\-./]+\.json$/;
const MAX_MODS = 32;

// Mod native: mods/<id>/manifest.json. Tiap mod diisolasi: rusak = dilewati, game tetap jalan.
class ModLoader {
  static async loadAll(registry, ctx) {
    const cfg = await Json.get("mods/mods.json", { enabled: [] });
    const ids = Array.isArray(cfg.enabled) ? cfg.enabled.filter(i => SAFE_ID.test(i)).slice(0, MAX_MODS) : [];
    const loaded = [];
    for (const id of ids) {
      try { loaded.push(await this.loadOne(registry, ctx, id)); }
      catch (err) { console.warn(`[Mod] "${id}" dilewati:`, err.message); }
    }
    return loaded;
  }

  static async loadOne(registry, ctx, id) {
    const man = await Json.get(`mods/${id}/manifest.json`);
    if (!man || man.id !== id) throw new Error("manifest hilang atau id tidak cocok");
    const files = (Array.isArray(man.blocks) ? man.blocks : []).filter(f => SAFE_FILE.test(f));
    const jsons = await Promise.all(files.map(f => Json.get(`mods/${id}/${f}`)));
    let count = 0;
    for (const json of jsons) if (json && await BlockLoader.register(registry, ctx, json, id)) count++;
    return { id, name: man.name || id, version: man.version || "0", blocks: count };
  }
}

return { ModLoader };
})();
const msrc_features_biome_colormap_js = (() => {
const { Assets } = msrc_core_assets_js;

// Colormap Minecraft (256x256): x = (1 - suhu), y = (1 - suhu*curah_hujan) -> warna rumput/daun per biome
class ColorMap {
  // Browser: baca piksel PNG sekali. Gagal -> null (pemanggil memakai warna cadangan)
  static load(path) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement("canvas");
        cv.width = img.width; cv.height = img.height;
        const g = cv.getContext("2d");
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, img.width, img.height);
        cv.width = cv.height = 0;
        resolve({ w: d.width, h: d.height, data: d.data });
      };
      img.onerror = () => { console.warn("[ColorMap] gagal memuat:", path); resolve(null); };
      img.src = Assets.url(path);
    });
  }

  // map: { w, h, data RGBA } -> [r, g, b] 0..1
  static sample(map, temperature, downfall) {
    const t = Math.min(1, Math.max(0, temperature));
    const r = Math.min(1, Math.max(0, downfall)) * t;
    const x = Math.round((1 - t) * (map.w - 1)), y = Math.round((1 - r) * (map.h - 1));
    const i = (y * map.w + x) * 4;
    return [map.data[i] / 255, map.data[i + 1] / 255, map.data[i + 2] / 255];
  }
}

return { ColorMap };
})();
const msrc_features_biome_biome_loader_js = (() => {
const { Json } = msrc_core_json_js;
const { Color } = msrc_core_color_js;
const { ColorMap } = msrc_features_biome_colormap_js;

const NAME = /^[a-z0-9_]+$/;
const FALLBACK_GRASS = [0.57, 0.74, 0.35];
const clamp = (v, d) => (Number.isFinite(v) ? Math.min(2, Math.max(-1, v)) : d);

// Biome klien: assets/biome/<nama>.client_biome.json (+ biomes_client.json sebagai cadangan),
// kabut dari assets/fog/<fog>.json, warna rumput dari assets/textures/colormap/grass.png
class BiomeLoader {
  static async load(id) {
    const name = String(id).split(":").pop();
    if (!NAME.test(name)) throw new Error("id biome tidak valid: " + id);
    const client = await Json.get(`assets/biome/${name}.client_biome.json`, null);
    const table = await Json.get("assets/biome/biomes_client.json", { biomes: {} });
    const entry = (table.biomes && (table.biomes[id] || table.biomes.default)) || {};
    const comp = client && client.client_biome && client.client_biome.components || {};
    const fogName = String(comp.fog || entry.fog_identifier || "").split(":").pop();
    const fog = NAME.test(fogName) ? await Json.get(`assets/fog/${fogName}.json`, null) : null;
    const climate = comp.climate || {};
    const temp = clamp(climate.temperature, 0.8), rain = clamp(climate.downfall, 0.4);
    const map = await ColorMap.load("assets/textures/colormap/grass.png");
    return {
      id,
      water: Color.hex(comp.water || entry.water_surface_color) || Color.hex("#44AFF5"),
      fog: fog && fog.fog_settings || null,
      grass: map ? ColorMap.sample(map, temp, rain) : FALLBACK_GRASS
    };
  }
}

return { BiomeLoader };
})();
const msrc_features_biome_fog_js = (() => {
const { Color } = msrc_core_color_js;

const DEFAULT_AIR = { fog_start: 0.92, fog_end: 1.0, fog_color: "#C0D8FF", render_distance_type: "render" };

class Fog {
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

return { Fog };
})();
const msrc_features_world_dimension_js = (() => {
const NS_ID = /^[a-z0-9_]+:[a-z0-9_]+$/;
const num = (v, def, min, max) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def);

// Berkas dimension/*.json -> pengaturan dunia yang sudah bersih (nilai tidak valid = bawaan)
class Dimension {
  static parse(json) {
    const d = json && json.dimension || {};
    const gen = d.generator && typeof d.generator === "object" ? d.generator : {};
    const spawn = d.spawn || {};
    return {
      id: NS_ID.test(d.identifier) ? d.identifier : "minecraft:overworld",
      biome: NS_ID.test(d.biome) ? d.biome : "minecraft:plains",
      height: Math.floor(num(d.height, 64, 8, 256)),
      renderDistance: Math.floor(num(d.render_distance, 4, 2, 12)),
      spawn: { x: num(spawn.x, 8.5, -3e7, 3e7), z: num(spawn.z, 8.5, -3e7, 3e7) },
      generator: { ...gen, type: typeof gen.type === "string" ? gen.type : "flat" }
    };
  }
}

return { Dimension };
})();
const msrc_features_world_chunk_js = (() => {
const CHUNK = 16;

// Penyimpanan satu chunk 16 x height x 16: Uint16 id blok, indeks = (y * 16 + z) * 16 + x
class Chunk {
  constructor(cx, cz, height) {
    this.cx = cx;
    this.cz = cz;
    this.height = height;
    this.data = new Uint16Array(CHUNK * CHUNK * height);
    this.top = 0;          // 1 + y blok tertinggi yang terisi (batas pindai mesher)
    this.modified = false; // diubah pemain/skrip: tidak boleh dibuang dari memori
    this.mesh = null;      // milik renderer (handle GPU)
  }

  get(lx, y, lz) { return this.data[(y * CHUNK + lz) * CHUNK + lx]; }

  set(lx, y, lz, id) {
    this.data[(y * CHUNK + lz) * CHUNK + lx] = id;
    if (id !== 0 && y >= this.top) this.top = y + 1;
    else if (id === 0 && y === this.top - 1) this.recomputeTop();
  }

  recomputeTop() {
    let y = this.top - 1;
    while (y >= 0 && !this.hasLayer(y)) y--;
    this.top = y + 1;
  }

  hasLayer(y) {
    const s = y * CHUNK * CHUNK;
    for (let i = s; i < s + CHUNK * CHUNK; i++) if (this.data[i] !== 0) return true;
    return false;
  }
}

return { CHUNK, Chunk };
})();
const msrc_features_world_chunk_stream_js = (() => {
const { CHUNK } = msrc_features_world_chunk_js;

// Memuat chunk di sekitar pemain (terdekat dulu, ada anggaran per panggilan) dan membuang yang jauh.
// Chunk yang pernah diubah tidak dibuang (belum ada penyimpanan dunia).
class ChunkStream {
  constructor(radius) {
    this.r = radius;
    this.cx = NaN;
    this.cz = NaN;
    this.queue = [];
  }

  update(world, px, pz, budget = 2) {
    const cx = Math.floor(px / CHUNK), cz = Math.floor(pz / CHUNK);
    if (cx !== this.cx || cz !== this.cz) { this.cx = cx; this.cz = cz; this.plan(world); }
    for (let i = 0; i < budget && this.queue.length; i++) {
      const c = this.queue.pop(); // terdekat ada di akhir
      world.load(c[0], c[1]);
    }
  }

  plan(world) {
    const r = this.r, q = [];
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        const d = dx * dx + dz * dz;
        if (d <= r * r && !world.has(this.cx + dx, this.cz + dz)) q.push([this.cx + dx, this.cz + dz, d]);
      }
    }
    this.queue = q.sort((a, b) => b[2] - a[2]);
    for (const c of [...world.chunks.values()]) {
      const far = Math.abs(c.cx - this.cx) > r + 1 || Math.abs(c.cz - this.cz) > r + 1;
      if (far && !c.modified) world.unload(c);
    }
  }
}

return { ChunkStream };
})();
const msrc_features_world_generators_flat_js = (() => {
const { CHUNK } = msrc_features_world_chunk_js;

// Dunia datar: layers dari bawah (y = 0) ke atas. Tinggi permukaan = jumlah semua 'count'.
const FlatGenerator = {
  id: "flat",

  // Mengembalikan { fill(chunk), surface } — id blok diselesaikan sekali di sini, bukan per chunk
  create(config, registry, height) {
    const slabs = [];
    for (const l of Array.isArray(config.layers) ? config.layers : []) {
      const id = registry.idOf(l && l.block);
      const count = Number.isInteger(l && l.count) ? l.count : 0;
      if (id < 1 || count < 1) { console.warn("[Flat] layer dilewati:", l && l.block); continue; }
      for (let i = 0; i < count && slabs.length < height; i++) slabs.push(id);
    }
    const area = CHUNK * CHUNK;
    return {
      surface: slabs.length,
      fill(chunk) {
        slabs.forEach((id, y) => chunk.data.fill(id, y * area, (y + 1) * area));
        chunk.top = slabs.length;
      }
    };
  }
};

return { FlatGenerator };
})();
const msrc_features_world_generators_index_js = (() => {
const { FlatGenerator } = msrc_features_world_generators_flat_js;

const map = new Map();

// Generator = { id, create(config, registry, height) -> { fill(chunk), surface } }
// Generator baru: satu berkas + satu baris di bawah (atau Generators.register dari mod).
class Generators {
  static register(g) {
    if (!g || typeof g.id !== "string" || typeof g.create !== "function") throw new Error("Generator tidak valid");
    map.set(g.id, g);
  }

  static get(type) {
    const g = map.get(type);
    if (!g) throw new Error(`Generator "${type}" tidak dikenal`);
    return g;
  }
}

[FlatGenerator].forEach(g => Generators.register(g));

return { Generators };
})();
const msrc_features_world_transform_scheduler_js = (() => {
// Menjalankan komponen "transforplacetop": blok yang ditutup berubah setelah N detik (waktu nyata, bukan frame).
class TransformScheduler {
  constructor() { this.timers = new Map(); }

  // Dipanggil World.setBlock: blok di (x,y,z) dan blok di bawahnya mungkin berubah statusnya
  onChange(world, x, y, z) {
    this.check(world, x, y - 1, z);
    this.check(world, x, y, z);
  }

  check(world, x, y, z) {
    const def = world.defAt(x, y, z), key = `${x},${y},${z}`;
    if (def.transform && world.getBlock(x, y + 1, z) > 0) {
      const t = this.timers.get(key);
      if (!t || t.id !== def.numId) this.timers.set(key, { x, y, z, id: def.numId, left: def.transform.seconds });
    } else this.timers.delete(key);
  }

  update(world, dt) {
    for (const [key, t] of this.timers) {
      t.left -= dt;
      if (t.left > 0) continue;
      this.timers.delete(key);
      const def = world.defAt(t.x, t.y, t.z);
      const to = def.transform ? world.reg.idOf(def.transform.to) : -1;
      if (def.numId === t.id && to >= 0 && world.getBlock(t.x, t.y + 1, t.z) > 0) world.setBlock(t.x, t.y, t.z, to);
    }
  }
}

return { TransformScheduler };
})();
const msrc_features_world_world_js = (() => {
const { Chunk, CHUNK } = msrc_features_world_chunk_js;
const { ChunkStream } = msrc_features_world_chunk_stream_js;
const { Generators } = msrc_features_world_generators_index_js;
const { TransformScheduler } = msrc_features_world_transform_scheduler_js;

const keyOf = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);

// Dunia: kumpulan chunk + generator dari dimension JSON. Tidak tahu apa pun soal GL.
class World {
  constructor(registry, dim) {
    this.reg = registry;
    this.dim = dim;
    this.height = dim.height;
    this.chunks = new Map();
    this.dirty = new Set();  // chunk yang meshnya perlu dibangun ulang
    this.sched = new TransformScheduler();
    this.stream = new ChunkStream(dim.renderDistance + 1);
    this.gen = Generators.get(dim.generator.type).create(dim.generator, registry, dim.height);
    this.surface = this.gen.surface;
    this.onUnload = null;    // callback(chunk): renderer melepas mesh GPU
  }

  has(cx, cz) { return this.chunks.has(keyOf(cx, cz)); }
  defAt(x, y, z) { return this.reg.at(this.getBlock(x, y, z)); }

  // id numerik; 0 di luar tinggi dunia; -1 bila chunk belum dimuat
  getBlock(x, y, z) {
    if (y < 0 || y >= this.height) return 0;
    const c = this.chunks.get(keyOf(x >> 4, z >> 4));
    return c ? c.data[(y * CHUNK + (z & 15)) * CHUNK + (x & 15)] : -1;
  }

  setBlock(x, y, z, id) {
    const c = this.chunks.get(keyOf(x >> 4, z >> 4));
    if (!c || y < 0 || y >= this.height || id < 0 || id >= this.reg.size) return false;
    const lx = x & 15, lz = z & 15;
    if (c.get(lx, y, lz) === id) return false;
    c.set(lx, y, lz, id);
    c.modified = true;
    this.markDirty(c);
    if (lx === 0) this.markDirty(this.chunks.get(keyOf(c.cx - 1, c.cz)));
    if (lx === 15) this.markDirty(this.chunks.get(keyOf(c.cx + 1, c.cz)));
    if (lz === 0) this.markDirty(this.chunks.get(keyOf(c.cx, c.cz - 1)));
    if (lz === 15) this.markDirty(this.chunks.get(keyOf(c.cx, c.cz + 1)));
    this.sched.onChange(this, x, y, z);
    return true;
  }

  markDirty(c) { if (c) this.dirty.add(c); }

  load(cx, cz) {
    if (this.has(cx, cz)) return;
    const c = new Chunk(cx, cz, this.height);
    this.gen.fill(c);
    this.chunks.set(keyOf(cx, cz), c);
    this.markDirty(c); // tetangga ikut: sisi yang tadinya menghadap chunk kosong kini perlu dihitung ulang
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => this.markDirty(this.chunks.get(keyOf(cx + dx, cz + dz))));
  }

  unload(c) {
    this.chunks.delete(keyOf(c.cx, c.cz));
    this.dirty.delete(c);
    if (this.onUnload) this.onUnload(c);
  }

  // Ambil sampai 'max' chunk yang perlu di-mesh (anggaran per frame agar tidak patah-patah)
  takeDirty(max) {
    const out = [];
    for (const c of this.dirty) {
      this.dirty.delete(c);
      out.push(c);
      if (out.length >= max) break;
    }
    return out;
  }

  // Tinggi permukaan padat tertinggi di bawah titik (x, y, z); chunk belum ada = tahan di y
  groundAt(x, y, z) {
    const bx = Math.floor(x), bz = Math.floor(z);
    if (!this.has(bx >> 4, bz >> 4)) return y;
    for (let by = Math.min(Math.floor(y), this.height - 1); by >= 0; by--) {
      if (this.reg.at(this.getBlock(bx, by, bz)).solid) return by + 1;
    }
    return -Infinity;
  }

  update(dt, pos) {
    this.stream.update(this, pos[0], pos[2]);
    this.sched.update(this, dt);
  }

  // Muat semua chunk sekitar titik secara sinkron (awal permainan)
  preload(x, z) { this.stream.update(this, x, z, Infinity); }
}

return { World };
})();
const msrc_features_world_world_loader_js = (() => {
const { Json } = msrc_core_json_js;
const { BlockRegistry } = msrc_features_block_block_registry_js;
const { BlockLoader } = msrc_features_block_block_loader_js;
const { ModelStore } = msrc_features_block_model_store_js;
const { TextureAtlas } = msrc_features_block_texture_atlas_js;
const { ModLoader } = msrc_features_mods_mod_loader_js;
const { BiomeLoader } = msrc_features_biome_biome_loader_js;
const { Fog } = msrc_features_biome_fog_js;
const { Dimension } = msrc_features_world_dimension_js;
const { World } = msrc_features_world_world_js;

const DEFAULT_DIMENSION = "dimension/overworld.flat.json";

// Merakit semua data dunia (tanpa GL): blok bawaan + mod -> atlas -> biome -> dunia, lalu muat chunk awal.
class WorldLoader {
  static async load(path = DEFAULT_DIMENSION) {
    const dim = Dimension.parse(await Json.get(path, {}));
    const registry = new BlockRegistry(), atlas = new TextureAtlas();
    const ctx = { registry, atlas, models: new ModelStore() };
    await BlockLoader.loadAll(registry, ctx);
    const mods = await ModLoader.loadAll(registry, ctx);
    atlas.freeze();
    const biome = await BiomeLoader.load(dim.biome);
    const world = new World(registry, dim);
    world.preload(dim.spawn.x, dim.spawn.z);
    const fog = Fog.resolve(biome.fog, dim.renderDistance * 16);
    return { dim, registry, atlas, biome, fog, mods, world, spawn: [dim.spawn.x, world.surface, dim.spawn.z] };
  }
}

return { DEFAULT_DIMENSION, WorldLoader };
})();
const msrc_features_world_face_table_js = (() => {
// Urutan sisi sama dengan DIRS di model-store: up, down, north, south, east, west.
// Tiap sudut: [sx, sy, sz, su, sv]; sx/sy/sz 0 = min, 1 = max kubus; su/sv = sudut UV (0..1).
// Urutan sudut berlawanan arah jarum jam dilihat dari luar (CULL_FACE BACK).
const FACES = [
  { n: [0, 1, 0], shade: 1.0, c: [[0, 1, 1, 0, 1], [1, 1, 1, 1, 1], [1, 1, 0, 1, 0], [0, 1, 0, 0, 0]] },
  { n: [0, -1, 0], shade: 0.5, c: [[0, 0, 0, 0, 0], [1, 0, 0, 1, 0], [1, 0, 1, 1, 1], [0, 0, 1, 0, 1]] },
  { n: [0, 0, -1], shade: 0.8, c: [[1, 0, 0, 0, 1], [0, 0, 0, 1, 1], [0, 1, 0, 1, 0], [1, 1, 0, 0, 0]] },
  { n: [0, 0, 1], shade: 0.8, c: [[0, 0, 1, 0, 1], [1, 0, 1, 1, 1], [1, 1, 1, 1, 0], [0, 1, 1, 0, 0]] },
  { n: [1, 0, 0], shade: 0.6, c: [[1, 0, 1, 0, 1], [1, 0, 0, 1, 1], [1, 1, 0, 1, 0], [1, 1, 1, 0, 0]] },
  { n: [-1, 0, 0], shade: 0.6, c: [[0, 0, 0, 0, 1], [0, 0, 1, 1, 1], [0, 1, 1, 1, 0], [0, 1, 0, 0, 0]] }
];

return { FACES };
})();
const msrc_features_world_chunk_mesher_js = (() => {
const { FACES } = msrc_features_world_face_table_js;
const { CHUNK } = msrc_features_world_chunk_js;
const { DIRS } = msrc_features_block_model_store_js;

const FLOATS = 13; // pos3 uv2 overlayUv2 warna3 warnaOverlay3
const WHITE = [1, 1, 1];

// Buffer kerja dipakai ulang antar chunk (tanpa alokasi per mesh); hasil disalin sekali ke ukuran pas.
let verts = new Float32Array(FLOATS * 4 * 1024);
let idx = new Uint32Array(6 * 1024);

function grow(quads) {
  if (verts.length >= quads * 4 * FLOATS) return;
  const v = new Float32Array(Math.max(verts.length * 2, quads * 4 * FLOATS));
  const i = new Uint32Array(v.length / FLOATS / 4 * 6);
  v.set(verts); i.set(idx);
  verts = v; idx = i;
}

class ChunkMesher {
  // -> { verts: Float32Array, idx: Uint32Array, quads } atau null bila chunk tidak punya sisi terlihat
  // tint: [r,g,b] warna biome. atlas harus sudah freeze().
  static build(world, chunk, atlas, tint) {
    const reg = world.reg, d = chunk.data, ox = chunk.cx * CHUNK, oz = chunk.cz * CHUNK;
    let q = 0;
    // id tetangga: di dalam chunk baca langsung; di luar lewat world (-1 = belum dimuat -> dianggap tertutup)
    const at = (x, y, z) => {
      if (y < 0) return -1;
      if (y >= chunk.height) return 0;
      if (x >= 0 && x < CHUNK && z >= 0 && z < CHUNK) return d[(y * CHUNK + z) * CHUNK + x];
      return world.getBlock(ox + x, y, oz + z);
    };
    for (let y = 0; y < chunk.top; y++) {
      for (let z = 0; z < CHUNK; z++) {
        for (let x = 0; x < CHUNK; x++) {
          const id = d[(y * CHUNK + z) * CHUNK + x];
          if (id === 0) continue;
          const def = reg.at(id);
          if (!def.visible) continue;
          for (const cube of def.model.cubes) {
            for (let f = 0; f < 6; f++) {
              const n = FACES[f].n, flush = n[0] + n[1] + n[2] > 0 ? 1 : 0;
              const axis = n[0] !== 0 ? 0 : n[1] !== 0 ? 1 : 2;
              if ((flush ? cube.max[axis] : cube.min[axis]) === flush) { // sisi rata dengan tepi blok -> bisa tertutup
                const nid = at(x + n[0], y + n[1], z + n[2]);
                if (nid < 0 || reg.at(nid).opaque) continue;
              }
              grow(q + 1);
              ChunkMesher.quad(q++, x, y, z, cube, f, def.faces[f], atlas, tint);
            }
          }
        }
      }
    }
    if (!q) return null;
    return { verts: verts.slice(0, q * 4 * FLOATS), idx: idx.slice(0, q * 6), quads: q };
  }

  static quad(q, x, y, z, cube, f, face, atlas, tint) {
    const F = FACES[f], uv = cube.uv && cube.uv[DIRS[f]];
    const r = atlas.rect(face.tex), o = face.ov >= 0 ? atlas.rect(face.ov) : null;
    const sub = uv || [0, 0, 1, 1];
    const cb = face.tintBase ? tint : WHITE, co = face.tintOv ? tint : WHITE, s = F.shade;
    for (let k = 0; k < 4; k++) {
      const c = F.c[k], i = (q * 4 + k) * FLOATS;
      verts[i] = x + (c[0] ? cube.max[0] : cube.min[0]);
      verts[i + 1] = y + (c[1] ? cube.max[1] : cube.min[1]);
      verts[i + 2] = z + (c[2] ? cube.max[2] : cube.min[2]);
      const fu = sub[0] + (sub[2] - sub[0]) * c[3], fv = sub[1] + (sub[3] - sub[1]) * c[4];
      verts[i + 3] = r[0] + (r[2] - r[0]) * fu;
      verts[i + 4] = r[1] + (r[3] - r[1]) * fv;
      verts[i + 5] = o ? o[0] + (o[2] - o[0]) * fu : -1;
      verts[i + 6] = o ? o[1] + (o[3] - o[1]) * fv : -1;
      verts[i + 7] = cb[0] * s; verts[i + 8] = cb[1] * s; verts[i + 9] = cb[2] * s;
      verts[i + 10] = co[0] * s; verts[i + 11] = co[1] * s; verts[i + 12] = co[2] * s;
    }
    const b = q * 4, j = q * 6;
    idx[j] = b; idx[j + 1] = b + 1; idx[j + 2] = b + 2;
    idx[j + 3] = b; idx[j + 4] = b + 2; idx[j + 5] = b + 3;
  }
}

return { FLOATS, ChunkMesher };
})();
const msrc_features_world_chunk_vao_js = (() => {
const STRIDE = 13 * 4;

// VAO + VBO + IBO satu chunk. Buffer dipakai ulang saat mesh dibangun ulang; dispose melepas semuanya.
class ChunkVao {
  static upload(gl, mesh, data) {
    const m = mesh || ChunkVao.create(gl);
    gl.bindVertexArray(m.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data.verts, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    m.count = data.idx.length;
    return m;
  }

  static create(gl) {
    const m = { vao: gl.createVertexArray(), vbo: gl.createBuffer(), ibo: gl.createBuffer(), count: 0 };
    gl.bindVertexArray(m.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
    [[0, 3, 0], [1, 2, 12], [2, 2, 20], [3, 3, 28], [4, 3, 40]].forEach(([loc, size, off]) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE, off);
    });
    gl.bindVertexArray(null);
    return m;
  }

  static draw(gl, m) {
    gl.bindVertexArray(m.vao);
    gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_INT, 0);
  }

  static dispose(gl, m) {
    if (!gl || !m) return;
    gl.deleteBuffer(m.vbo);
    gl.deleteBuffer(m.ibo);
    gl.deleteVertexArray(m.vao);
  }
}

return { ChunkVao };
})();
const msrc_features_world_world_renderer_js = (() => {
const { ShaderProgram } = msrc_shaders_RenderVulkan_shader_program_js;
const { ShaderPack } = msrc_shaders_shader_pack_js;
const { ChunkMesher } = msrc_features_world_chunk_mesher_js;
const { ChunkVao } = msrc_features_world_chunk_vao_js;

const MESH_BUDGET = 3; // chunk yang di-mesh per frame

// Menggambar chunk: satu atlas, satu program shader, satu draw per chunk. Semua sumber daya GPU dilepas di dispose().
class WorldRenderer {
  constructor(glContext, loaded) {
    this.gl = glContext.getGL();
    this.loaded = loaded;
    this.world = loaded.world;
    this.program = ShaderPack.create(this.gl, "blocks");
    const gl = this.gl, p = this.program;
    this.u = Object.fromEntries(["viewProj", "chunk", "cam", "atlas", "fogColor", "fog"]
      .map(n => [n, gl.getUniformLocation(p, "u_" + n)]));
    this.ready = false;
    this.disposed = false;
    this.world.onUnload = c => this.free(c);
    loaded.atlas.build(gl).then(() => { this.ready = !this.disposed; }).catch(e => console.error("[World] atlas gagal:", e));
  }

  free(chunk) {
    ChunkVao.dispose(this.gl, chunk.mesh);
    chunk.mesh = null;
  }

  remesh(chunk) {
    const data = ChunkMesher.build(this.world, chunk, this.loaded.atlas, this.loaded.biome.grass);
    if (!data) return this.free(chunk);
    chunk.mesh = ChunkVao.upload(this.gl, chunk.mesh, data);
  }

  render(camera) {
    if (!this.ready) return;
    const gl = this.gl, L = this.loaded, f = L.fog;
    for (const c of this.world.takeDirty(MESH_BUDGET)) this.remesh(c);
    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, L.atlas.texture);
    gl.uniform1i(this.u.atlas, 0);
    gl.uniformMatrix4fv(this.u.viewProj, false, camera.viewProjMatrix);
    gl.uniform3fv(this.u.cam, camera.position);
    gl.uniform3fv(this.u.fogColor, f.color);
    gl.uniform2f(this.u.fog, f.start, f.end);
    for (const c of this.world.chunks.values()) {
      if (!c.mesh) continue;
      gl.uniform3f(this.u.chunk, c.cx * 16, 0, c.cz * 16);
      ChunkVao.draw(gl, c.mesh);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.CULL_FACE);
  }

  dispose() {
    this.disposed = true;
    this.world.onUnload = null;
    for (const c of this.world.chunks.values()) this.free(c);
    this.loaded.atlas.dispose(this.gl);
    ShaderProgram.dispose(this.gl, this.program);
    this.program = null;
    this.gl = null;
  }
}

return { WorldRenderer };
})();
const msrc_main_js = (() => {
const { DeviceGuard } = msrc_core_platform_device_guard_js;
const { OrientationLock } = msrc_core_platform_orientation_lock_js;
const { WebGLContext } = msrc_shaders_RenderVulkan_webgl_context_js;
const { TouchLook } = msrc_core_input_touch_look_js;
const { TouchAction } = msrc_core_input_touch_action_js;
const { TouchRing } = msrc_core_input_touch_ring_js;
const { Options } = msrc_core_options_options_js;
const { Camera, PerspectiveMode } = msrc_features_camera_camera_js;
const { PerspectiveButton } = msrc_features_camera_ui_perspective_btn_js;
const { SkyRenderer } = msrc_features_sky_sky_renderer_js;
const { NametagRenderer } = msrc_features_player_nametag_nametag_renderer_js;
const { PlayerRenderer } = msrc_features_player_player_renderer_js;
const { MoveInput } = msrc_features_movement_move_input_js;
const { PlayerState } = msrc_features_movement_player_state_js;
const { PlayerPhysics } = msrc_features_movement_physics_js;
const { ViewBob } = msrc_features_movement_view_bob_js;
const { AirborneGate } = msrc_features_movement_air_gate_js;
const { MoveControls } = msrc_features_movement_ui_move_controls_js;
const { WorldLoader } = msrc_features_world_world_loader_js;
const { WorldRenderer } = msrc_features_world_world_renderer_js;

const MAX_DT_MS = 100; // batasi lonjakan waktu (tab di-background, lag)

class MineHTMLApp {
  constructor() {
    this.glContext = null;
    this.touchLook = null;
    this.touchAction = null;
    this.camera = null;
    this.perspectiveBtn = null;
    this.skyRenderer = null;
    this.playerRenderer = null;
    this.world = null;
    this.worldRenderer = null;
    this.moveInput = null;
    this.playerState = null;
    this.physics = null;
    this.moveControls = null;
    this.actions = null;
    this.touchRing = null;
    this.nametag = null;
    this.lastTime = 0;
    this.frameId = null;
    this.boundLoop = this.loop.bind(this);
  }

  async init() {
    if (!DeviceGuard.validate()) return;
    OrientationLock.init();
    const opt = await Options.load("option.json"); // selalu valid (default bila gagal)

    this.glContext = new WebGLContext();
    this.touchLook = new TouchLook(this.glContext.canvas);
    this.touchAction = new TouchAction(this.glContext.canvas);
    this.camera = new Camera(70);
    this.camera.setSensitivityScale(opt.cameraSensitivity);
    this.perspectiveBtn = new PerspectiveButton(this.camera);
    this.skyRenderer = new SkyRenderer(this.glContext);
    this.playerRenderer = new PlayerRenderer(this.glContext, opt);
    this.nametag = new NametagRenderer(this.glContext, opt.playerName);

    this.moveInput = new MoveInput();
    this.playerState = new PlayerState();
    await this.initWorld();
    this.physics = new PlayerPhysics((x, y, z) => (this.world ? this.world.groundAt(x, y, z) : 0));
    this.moveControls = new MoveControls(this.moveInput);
    this.actions = new AirborneGate(this.touchAction, this.playerState);
    this.touchRing = new TouchRing(opt.touchCircle);

    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  // Dunia dari dimension/*.json. Gagal dimuat = game tetap jalan tanpa dunia (ground 0).
  async initWorld() {
    try {
      const loaded = await WorldLoader.load();
      this.world = loaded.world;
      this.worldRenderer = new WorldRenderer(this.glContext, loaded);
      this.playerState.pos = loaded.spawn;
    } catch (err) {
      console.error("[MineHTML World Error]", err);
    }
  }

  loop() {
    try {
      const { dx, dy } = this.touchLook.consumeDelta();
      if (dx !== 0 || dy !== 0) this.camera.rotate(dx, dy);

      const now = performance.now();
      const dtMs = Math.min(now - this.lastTime, MAX_DT_MS);
      this.lastTime = now;
      const s = this.playerState;
      this.physics.update(s, this.moveInput, this.camera.yaw, dtMs);
      if (this.world) this.world.update(dtMs / 1000, s.pos);
      ViewBob.update(s, dtMs);
      this.moveControls.sync(s);
      this.touchRing.update(this.actions.holdProgress(), this.actions.touchX, this.actions.touchY);

      this.camera.follow(s.pos, s.eye);
      this.camera.update(this.glContext.getAspect(), s.bob);

      const gl = this.glContext.getGL();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // 1. Gambar Langit Gradasi
      gl.disable(gl.DEPTH_TEST);
      this.skyRenderer.render(this.camera);

      // 2. Dunia (blok)
      if (this.worldRenderer) this.worldRenderer.render(this.camera);

      // 3. Karakter Pemain (animasi pukul mengikuti input sentuh); tangan orang pertama selalu di depan
      if (this.camera.mode === PerspectiveMode.FIRST_PERSON) gl.clear(gl.DEPTH_BUFFER_BIT);
      this.playerRenderer.render(this.camera, this.actions, s);

      // 4. Nametag (hanya orang kedua/ketiga; dilewati di orang pertama)
      this.nametag.render(this.camera, s);
    } catch (err) {
      console.error("[MineHTML Loop Safe Error]", err);
    }

    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  destroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (this.perspectiveBtn) this.perspectiveBtn.dispose();
    if (this.moveControls) this.moveControls.dispose();
    if (this.touchRing) this.touchRing.dispose();
    if (this.touchLook) this.touchLook.dispose();
    if (this.touchAction) this.touchAction.dispose();
    if (this.skyRenderer) this.skyRenderer.dispose();
    if (this.nametag) this.nametag.dispose();
    if (this.playerRenderer) this.playerRenderer.dispose();
    if (this.worldRenderer) this.worldRenderer.dispose();
    if (this.glContext) this.glContext.dispose();
  }
}

const start = () => new MineHTMLApp().init().catch(err => console.error("[MineHTML Init Error]", err));
// Aman dimuat kapan saja: sebelum DOM siap (tunggu) atau sesudahnya (jalan langsung)
if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", start);
else start();

return {  };
})();
})();
