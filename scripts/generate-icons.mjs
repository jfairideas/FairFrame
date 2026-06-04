/**
 * Generates FairFrame app icons (viewfinder mark on near-black).
 * Run: npm install && npm run generate-icons
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "assets");

const BG = "#0A0A0B";
const ACCENT = "#3B82F6";
const WHITE = "#FFFFFF";

function viewfinderSvg(size) {
  const pad = Math.round(size * 0.18);
  const corner = Math.round(size * 0.14);
  const stroke = Math.max(4, Math.round(size * 0.018));
  const inner = size - pad * 2;
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" fill="none" stroke="${ACCENT}" stroke-width="${stroke}" rx="8"/>
  <path d="M${pad} ${pad + corner} V${pad} H${pad + corner}" fill="none" stroke="${WHITE}" stroke-width="${stroke}" stroke-linecap="round"/>
  <path d="M${size - pad - corner} ${pad} H${size - pad} V${pad + corner}" fill="none" stroke="${WHITE}" stroke-width="${stroke}" stroke-linecap="round"/>
  <path d="M${pad} ${size - pad - corner} V${size - pad} H${pad + corner}" fill="none" stroke="${WHITE}" stroke-width="${stroke}" stroke-linecap="round"/>
  <path d="M${size - pad} ${size - pad - corner} V${size - pad} H${size - pad - corner}" fill="none" stroke="${WHITE}" stroke-width="${stroke}" stroke-linecap="round"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${Math.round(size * 0.06)}" fill="${ACCENT}"/>
</svg>`;
}

async function writePng(name, size) {
  const svg = Buffer.from(viewfinderSvg(size));
  await sharp(svg).png().toFile(join(assetsDir, name));
  console.log(`Wrote ${name} (${size}px)`);
}

await writePng("icon.png", 1024);
await writePng("adaptive-icon.png", 1024);
await writePng("splash-icon.png", 512);
await writePng("favicon.png", 48);
console.log("Done.");
