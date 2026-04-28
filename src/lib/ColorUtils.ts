interface HSV {
  h: number;
  s: number;
  v: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function hsv2rgb(hsv: HSV): RGB {
  let r = 0, g = 0, b = 0;
  const h = clamp(hsv.h, 0, 1);
  const s = clamp(hsv.s, 0, 1);
  const v = hsv.v;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgb2hsv(r: number | RGB, g?: number, b?: number): HSV {
  let red: number, green: number, blue: number;

  if (typeof r === 'object') {
    red = r.r / 255;
    green = r.g / 255;
    blue = r.b / 255;
  } else {
    red = r / 255;
    green = (g ?? 0) / 255;
    blue = (b ?? 0) / 255;
  }

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    if (max === red) {
      h = ((green - blue) + d * (green < blue ? 6 : 0)) / (6 * d);
    } else if (max === green) {
      h = ((blue - red) + d * 2) / (6 * d);
    } else {
      h = ((red - green) + d * 4) / (6 * d);
    }
  }

  return { h, s, v };
}
