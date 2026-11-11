import { Assets } from "../../core/assets.js";
export class TextureLoader {
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