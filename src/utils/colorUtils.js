// src/utils/colorUtils.js

// Convert hex string to RGB array
export const hexToRgbArray = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Convert hex to RGB string
export const hexToRgb = (hex) => {
  const [r, g, b] = hexToRgbArray(hex);
  return `rgb(${r}, ${g}, ${b})`;
};

// Convert hex to HSL string
export const hexToHsl = (hex) => {
  let [r, g, b] = hexToRgbArray(hex).map((v) => v / 255);
  let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

// Get luminance of a hex color
export const getLuminance = (hex) => {
  const [r, g, b] = hexToRgbArray(hex).map((v) => v / 255);
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

// Get contrast ratio between two hex colors
export const getContrast = (hex1, hex2) => {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
};

import namer from 'color-namer';

export const getColorName = (hex) => {
  const result = namer(hex);
  return result.ntc[0].name; // or result.html[0].name if you prefer HTML color names
};

// Choose black or white text based on background color contrast
export const getBestTextColor = (hex) => {
  const contrastWithWhite = getContrast(hex, "#ffffff");
  const contrastWithBlack = getContrast(hex, "#000000");
  return contrastWithWhite > contrastWithBlack ? "#ffffff" : "#000000";
};
