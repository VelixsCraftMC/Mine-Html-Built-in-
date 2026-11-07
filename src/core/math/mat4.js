export class Mat4 {
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