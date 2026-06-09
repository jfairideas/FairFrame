/**
 * Generates FairFrame emblem PNGs from handbook v1.1 geometry (F-form + 42° wedge).
 * Run: node scripts/generate-brand-mark.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const brandDir = join(__dirname, "..", "assets", "brand");

const BLACK = "#000000";
const WHITE = "#FFFFFF";
const BLUE = "#2F80FF";

/** Horizontal mark: F stem + bars left, progression wedge right, protected gap. */
function emblemSvg(fill, width = 1024, height = 512) {
  const scale = width / 1024;
  const stemW = Math.round(72 * scale);
  const stemH = Math.round(380 * scale);
  const barW = Math.round(220 * scale);
  const barH = Math.round(56 * scale);
  const x0 = Math.round(80 * scale);
  const y0 = Math.round(66 * scale);
  const gap = Math.round(48 * scale);
  const wedgeX = x0 + stemW + barW + gap;
  const wedgeW = Math.round(520 * scale);
  const wedgeH = Math.round(380 * scale);
  const wedgeY = y0;
  const wedgeTip = wedgeX + wedgeW;
  const wedgeBottom = wedgeY + wedgeH;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="none"/>
  <rect x="${x0}" y="${y0}" width="${stemW}" height="${stemH}" fill="${fill}"/>
  <rect x="${x0}" y="${y0}" width="${barW}" height="${barH}" fill="${fill}"/>
  <rect x="${x0}" y="${y0 + Math.round(162 * scale)}" width="${barW}" height="${barH}" fill="${fill}"/>
  <polygon points="${wedgeX},${wedgeY} ${wedgeTip},${wedgeY + Math.round(wedgeH / 2)} ${wedgeX},${wedgeBottom}" fill="${fill}"/>
</svg>`;
}

async function writePng(name, svg, bg = null) {
  let pipeline = sharp(Buffer.from(svg));
  if (bg) {
    pipeline = sharp({
      create: { width: 1024, height: 512, channels: 4, background: bg },
    }).composite([{ input: Buffer.from(svg) }]);
  }
  await pipeline.png().toFile(join(brandDir, name));
  console.log(`Wrote ${name}`);
}

await mkdir(brandDir, { recursive: true });
await writeFile(join(brandDir, "fairframe_mark_v1_vector_trace.svg"), emblemSvg(BLACK));

await writePng("fairframe_mark_black_transparent_1024.png", emblemSvg(BLACK));
await writePng("fairframe_mark_white_transparent_1024.png", emblemSvg(WHITE));
await writePng("fairframe_mark_blue_transparent_1024.png", emblemSvg(BLUE));
await writePng("fairframe_mark_black_on_white_1024.png", emblemSvg(BLACK), WHITE);
await writePng("fairframe_mark_white_on_black_1024.png", emblemSvg(WHITE), BLACK);

console.log("Brand mark assets ready in assets/brand/");
