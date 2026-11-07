export class OrientationLock {
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