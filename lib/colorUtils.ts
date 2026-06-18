import type { ColorScale, Shade } from './types';

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generateScale(baseHex: string): ColorScale {
  const { h, s, l } = hexToHsl(baseHex);

  const lMap: Record<number, number> = {
    100: Math.min(97, l + (97 - l) * 0.90),
    200: Math.min(95, l + (97 - l) * 0.72),
    300: Math.min(90, l + (97 - l) * 0.50),
    400: Math.min(85, l + (97 - l) * 0.25),
    600: Math.max(8, l - (l - 8) * 0.20),
    700: Math.max(8, l - (l - 8) * 0.42),
    800: Math.max(8, l - (l - 8) * 0.64),
    900: Math.max(8, l - (l - 8) * 0.82),
  };
  const sMap: Record<number, number> = {
    100: Math.min(s * 0.22, 30),
    200: Math.min(s * 0.42, 55),
    300: Math.min(s * 0.62, 75),
    400: Math.min(s * 0.82, 92),
    600: Math.min(s * 1.05, 100),
    700: Math.min(s * 1.08, 100),
    800: Math.min(s * 1.04, 100),
    900: Math.min(s * 0.93, 100),
  };

  const scale = { 500: baseHex } as ColorScale;
  ([100, 200, 300, 400, 600, 700, 800, 900] as Shade[]).forEach((step) => {
    scale[step] = hslToHex(h, sMap[step], lMap[step]);
  });
  return scale;
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#111827' : '#ffffff';
}
