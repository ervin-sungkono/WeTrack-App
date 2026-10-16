export function stringToColour(string: string, saturation = 100, lightness = 30): string {
  let hash = 0;
  for (let index = 0; index < string.length; index += 1) {
    hash = string.charCodeAt(index) + ((hash << 5) - hash);
    hash |= 0;
  }
  return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
}

export function pickTextColorBasedOnBgColor(
  bgColor: string,
  lightColor = "#FFFFFF",
  darkColor = "#2B2B2B",
): string {
  const color = bgColor.startsWith("#") ? bgColor.substring(1, 7) : bgColor.substring(0, 6);
  if (!/^[\da-f]{6}$/i.test(color)) return darkColor;
  const [red, green, blue] = [0, 2, 4].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255);
  const linear = [red, green, blue].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return luminance > 0.179 ? darkColor : lightColor;
}

export function getRandomColor(): string {
  const digits = "0123456789ABCDEF";
  let color = "#";
  for (let index = 0; index < 6; index += 1) {
    color += digits[Math.floor(Math.random() * digits.length)];
  }
  return color;
}

function hslToRgb(hue: number, saturation: number, lightness: number): string {
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;
  const chroma = (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const secondary = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const offset = normalizedLightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) [red, green, blue] = [chroma, secondary, 0];
  else if (hue < 120) [red, green, blue] = [secondary, chroma, 0];
  else if (hue < 180) [red, green, blue] = [0, chroma, secondary];
  else if (hue < 240) [red, green, blue] = [0, secondary, chroma];
  else if (hue < 300) [red, green, blue] = [secondary, 0, chroma];
  else [red, green, blue] = [chroma, 0, secondary];

  const toByte = (channel: number): number => Math.round((channel + offset) * 255);
  return `rgb(${toByte(red)}, ${toByte(green)}, ${toByte(blue)})`;
}

export function generateColors(count: number): string[] {
  if (count <= 0) return [];
  const step = 360 / count;
  return Array.from({ length: count }, (_, index) => hslToRgb(index * step, 100, 40));
}
