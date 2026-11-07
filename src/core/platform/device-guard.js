export class DeviceGuard {
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