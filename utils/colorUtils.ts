/**
 * Color utility functions for the app
 */

/**
 * Get a color on a green-to-orange gradient based on percentage
 * Lower percentages (0-40%) are mostly dark green, higher percentages (40-100%) gradually become bright orange
 */
export function getGreenToOrangeGradient(percentage: number): string {
  // Create a smooth gradient from dark green to bright orange
  if (percentage <= 40) {
    // Dark green for low values (0-40%)
    // Start with dark teal-green at 0%, gradually transition to green-orange at 40%
    const normalizedValue = percentage / 40; // 0 to 1 for 0% to 40%
    const greenComponent = Math.round(100 + (200 - 100) * normalizedValue); // 64 -> C8 (darker green)
    const redComponent = Math.round(50 + (180 - 50) * normalizedValue); // 32 -> B4 (more red for transition)
    const blueComponent = Math.round(80 + (0 - 80) * normalizedValue); // 50 -> 00 (less blue)
    return `#${redComponent.toString(16).padStart(2, '0')}${greenComponent.toString(16).padStart(2, '0')}${blueComponent.toString(16).padStart(2, '0')}`;
  } else if (percentage <= 100) {
    // Bright orange for higher values (40-100%)
    const normalizedValue = (percentage - 40) / 60; // 0 to 1 for 40% to 100%
    const greenComponent = Math.round(200 + (255 - 200) * normalizedValue); // C8 -> FF (brighter green)
    const redComponent = Math.round(180 + (255 - 180) * normalizedValue); // B4 -> FF (brighter red)
    const blueComponent = Math.round(0 + (0 - 0) * normalizedValue); // 00 -> 00 (stays 0)
    return `#${redComponent.toString(16).padStart(2, '0')}${greenComponent.toString(16).padStart(2, '0')}${blueComponent.toString(16).padStart(2, '0')}`;
  }
  return '#FF9500'; // Fallback to orange for very high values
}

/**
 * Get a color inspired by the Apple Weather app's temperature gradient based on percentage
 * Maps burnout percentage to different hues (icy blue to warm coral)
 */
export function getAppleWeatherGradientColor(percentage: number): string {
  // Define key color points and their associated percentages
  const colorPoints = [
    { percent: 0, color: '#4FC3F7' },   // Light Icy Blue (below 30% will be this)
    { percent: 20, color: '#4FC3F7' },  // Light Icy Blue
    { percent: 30, color: '#4FC3F7' },  // Light Icy Blue (extended to 30%)
    { percent: 50, color: '#FFF176' },  // Pale Yellow (transition starts here)
    { percent: 70, color: '#FFB74D' },  // Soft Orange
    { percent: 80, color: '#FF8C6B' },  // Tiny Orangey Reddish
    { percent: 90, color: '#FF7F00' },  // Intensive Orange (for 80% range)
    { percent: 100, color: '#EF5350' } // Warm Coral / Red-Orange (for >90%)
  ];

  // Clamp percentage to ensure it's within 0-100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Find the two color points to interpolate between
  let startPoint = colorPoints[0];
  let endPoint = colorPoints[colorPoints.length - 1];

  for (let i = 0; i < colorPoints.length - 1; i++) {
    if (clampedPercentage >= colorPoints[i].percent && clampedPercentage <= colorPoints[i + 1].percent) {
      startPoint = colorPoints[i];
      endPoint = colorPoints[i + 1];
      break;
    }
  }

  // Calculate interpolation factor (t)
  const range = endPoint.percent - startPoint.percent;
  let t = 0;
  if (range > 0) {
    t = (clampedPercentage - startPoint.percent) / range;
  }

  // Interpolate the color
  return lerpColor(startPoint.color, endPoint.color, t);
}

/**
 * Linearly interpolates between two HEX colors.
 * @param color1 The first HEX color (e.g., '#RRGGBB').
 * @param color2 The second HEX color (e.g., '#RRGGBB').
 * @param t The interpolation factor (0.0 to 1.0).
 * @returns The interpolated HEX color.
 */
function lerpColor(color1: string, color2: string, t: number): string {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' +
      Math.round(r).toString(16).padStart(2, '0') +
      Math.round(g).toString(16).padStart(2, '0') +
      Math.round(b).toString(16).padStart(2, '0');
  };

  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = c1.r + (c2.r - c1.r) * t;
  const g = c1.g + (c2.g - c1.g) * t;
  const b = c1.b + (c2.b - c1.b) * t;

  return rgbToHex(r, g, b);
}

/**
 * Lightens a HEX color by mixing it with white.
 * @param hexColor The HEX color to lighten (e.g., '#RRGGBB').
 * @param mixFactor The factor to mix with white (0.0 to 1.0, where 1.0 is pure white).
 * @returns The lightened HEX color.
 */
export function lightenHexColor(hexColor: string, mixFactor: number): string {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' +
      Math.round(r).toString(16).padStart(2, '0') +
      Math.round(g).toString(16).padStart(2, '0') +
      Math.round(b).toString(16).padStart(2, '0');
  };

  const color = hexToRgb(hexColor);

  const r = color.r + (255 - color.r) * mixFactor;
  const g = color.g + (255 - color.g) * mixFactor;
  const b = color.b + (255 - color.b) * mixFactor;

  return rgbToHex(r, g, b);
} 