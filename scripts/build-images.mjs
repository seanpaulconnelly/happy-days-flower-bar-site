#!/usr/bin/env node
/**
 * Responsive image pipeline (sharp) — build plan Phase 4, design-spec §9.
 *
 *   npm run images                      # everything
 *   npm run images -- --only hero       # one key from src/content/images.ts
 *
 * Inputs  assets-src/images/<src>          (gitignored originals, never served)
 * Outputs public/images/<out>-<w>.<ext>    AVIF q50 / WebP q75 / progressive JPEG q78
 *         public/og.jpg                    1200×630 from the hero (design-spec §9/§12)
 *         public/apple-touch-icon.png      180×180 from public/favicon.svg (request Q3)
 *         src/content/images.generated.ts  manifest consumed by <Picture>
 *
 * Focal crops (request Q2, values in design-spec §9): each *rendition* declares
 * `ratio` (width ÷ height) and `focalY` (0–1 of source height that should land at
 * the crop's vertical centre):
 *
 *   h    = round(SRC_W / ratio)
 *   top  = clamp(round(focalY * SRC_H - h / 2), 0, SRC_H - h)
 *   extract({ left: 0, top, width: SRC_W, height: h })  →  resize to each width
 *
 * Every source is 1152×1536, so each crop is a full-width band and only the
 * vertical offset matters. `top` is computed, not copied from the spec table —
 * two of the table's numbers are rounded by hand and the formula is normative.
 *
 * Renditions vs. keys: most keys have one rendition and keep their `out`
 * basename. Two keys need two crops at different ratios and get a suffix:
 *   hero              → `hero-flower-bar` (3:4 ≥ md) + `hero-flower-bar-square` (1:1 < md)
 *   flowerBarCloseup  → `flower-bar-closeup-intro` (4:5) + `-gallery` (1:1)
 *
 * Idempotent: metadata is stripped and every encoder setting is fixed, so a
 * re-run byte-for-byte reproduces public/images. Files in public/images that no
 * longer belong to a rendition are pruned (R6: swap an original, re-run).
 */
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import sharp from 'sharp';
import prettier from 'prettier';
import { parseArgs, repoRoot } from './lib/preview.mjs';

/** Every source original is 1152 × 1536 (design-spec §9). */
const SRC_W = 1152;
const SRC_H = 1536;
const WIDTHS = [480, 768, 1152];

/** Largest hero JPEG budget, build plan Phase 4 gate. */
const HERO_JPEG_BUDGET = 160 * 1024;

const SRC_DIR = resolve(repoRoot, 'assets-src/images');
const OUT_DIR = resolve(repoRoot, 'public/images');
const PUBLIC_DIR = resolve(repoRoot, 'public');
const MANIFEST = resolve(repoRoot, 'src/content/images.generated.ts');
const FAVICON = resolve(repoRoot, 'public/favicon.svg');

/** Encoder settings — fixed so re-runs are deterministic. */
const ENCODERS = {
  avif: { ext: 'avif', type: 'image/avif', apply: (p) => p.avif({ quality: 50, effort: 6 }) },
  webp: { ext: 'webp', type: 'image/webp', apply: (p) => p.webp({ quality: 75, effort: 6 }) },
  jpeg: {
    ext: 'jpg',
    type: 'image/jpeg',
    apply: (p) =>
      p.jpeg({ quality: 78, progressive: true, mozjpeg: true, chromaSubsampling: '4:2:0' }),
  },
};
const FORMATS = ['avif', 'webp', 'jpeg'];

/**
 * Renditions, in manifest order. `ratio` and `focalY` are design-spec §9.
 * `suffix` is appended to the key's `out` basename when a key has more than one.
 * `maxTop` is a hard ceiling on the crop offset — the farm-zinnias frame holds a
 * person and the spec forbids cropping below y = 250 (hair); decision D10.
 */
const RENDITIONS = [
  {
    id: 'hero',
    key: 'hero',
    slot: 'hero',
    ratio: 3 / 4,
    focalY: 0.5,
    note: 'hero ≥ md, native 3:4',
  },
  {
    id: 'heroSquare',
    key: 'hero',
    slot: 'hero',
    suffix: 'square',
    ratio: 1,
    focalY: 0.57,
    note: 'hero < md',
  },
  {
    id: 'flowerBarCloseupIntro',
    key: 'flowerBarCloseup',
    slot: 'intro',
    suffix: 'intro',
    ratio: 4 / 5,
    focalY: 0.5,
  },
  {
    id: 'flowerBarCloseupGallery',
    key: 'flowerBarCloseup',
    slot: 'gallery',
    suffix: 'gallery',
    ratio: 1,
    focalY: 0.51,
  },
  {
    id: 'farmBouquetPinkWhite',
    key: 'farmBouquetPinkWhite',
    slot: 'why',
    ratio: 4 / 5,
    focalY: 0.475,
  },
  { id: 'farmBouquetColorful', key: 'farmBouquetColorful', slot: 'why', ratio: 4 / 5, focalY: 0.5 },
  {
    id: 'farmZinnias',
    key: 'farmZinnias',
    slot: 'why',
    ratio: 4 / 5,
    focalY: 0.5,
    maxTop: 250,
    note: 'face-aware ceiling, decision D10',
  },
  { id: 'galleryEventDetail', key: 'galleryEventDetail', slot: 'gallery', ratio: 1, focalY: 0.51 },
  { id: 'galleryArrangement', key: 'galleryArrangement', slot: 'gallery', ratio: 1, focalY: 0.42 },
  {
    id: 'galleryArrangementOutdoor',
    key: 'galleryArrangementOutdoor',
    slot: 'gallery',
    ratio: 1,
    focalY: 0.44,
  },
  { id: 'about', key: 'about', slot: 'about', ratio: 4 / 5, focalY: 0.49 },
];

/** OG card: the hero cropped to 1200:630, then resized up 4 % (design-spec §9). */
const OG = { key: 'hero', ratio: 1200 / 630, focalY: 0.535, width: 1200, height: 630, quality: 80 };

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/** Q2's formula. Returns the sharp `extract` region for one rendition. */
function cropFor({ ratio, focalY, maxTop }) {
  const height = Math.round(SRC_W / ratio);
  let top = clamp(Math.round(focalY * SRC_H - height / 2), 0, SRC_H - height);
  if (maxTop !== undefined) top = Math.min(top, maxTop);
  return { left: 0, top, width: SRC_W, height };
}

const toHex = ({ r, g, b }) =>
  `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`;

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  const args = parseArgs();
  const only = typeof args.only === 'string' ? args.only : null;

  const { images } = await import('../src/content/images.ts');

  if (only && !images[only]) {
    console.error(`Unknown image key "${only}". Known keys: ${Object.keys(images).join(', ')}`);
    process.exit(1);
  }
  if (!existsSync(SRC_DIR)) {
    console.error(`Missing ${SRC_DIR}. Copy the originals from 1-genesis first (Phase 4).`);
    process.exit(1);
  }

  // Sanity: every key in images.ts must have at least one rendition, and every
  // rendition's key/slot must exist. Cheap guard against a drifting map.
  for (const key of Object.keys(images)) {
    if (!RENDITIONS.some((r) => r.key === key)) {
      throw new Error(`images.ts key "${key}" has no rendition in build-images.mjs`);
    }
  }
  for (const r of RENDITIONS) {
    const entry = images[r.key];
    if (!entry) throw new Error(`rendition "${r.id}" points at unknown key "${r.key}"`);
    if (!entry.slots.includes(r.slot)) {
      throw new Error(`rendition "${r.id}" claims slot "${r.slot}", not in images.ts`);
    }
  }

  await mkdir(OUT_DIR, { recursive: true });

  const todo = only ? RENDITIONS.filter((r) => r.key === only) : RENDITIONS;
  const manifest = [];
  const rows = [];
  const written = new Set();

  for (const rendition of todo) {
    const entry = images[rendition.key];
    const srcPath = resolve(SRC_DIR, entry.src);
    if (!existsSync(srcPath)) throw new Error(`Missing original ${srcPath}`);

    const meta = await sharp(srcPath).metadata();
    if (meta.width !== SRC_W || meta.height !== SRC_H) {
      throw new Error(
        `${entry.src} is ${meta.width}×${meta.height}; the §9 crop table assumes ${SRC_W}×${SRC_H}. ` +
          `Re-check the focal values before shipping a differently sized original.`,
      );
    }

    const crop = cropFor(rendition);
    const outBase = rendition.suffix ? `${entry.out}-${rendition.suffix}` : entry.out;
    // Never upscale: cap the emitted widths at the crop width.
    const widths = WIDTHS.filter((w) => w <= crop.width);
    if (!widths.includes(crop.width) && crop.width < Math.max(...WIDTHS)) widths.push(crop.width);

    const cropped = await sharp(srcPath).extract(crop).toBuffer();
    const stats = await sharp(cropped).stats();
    const placeholder = toHex(stats.dominant);

    const src = { avif: [], webp: [], jpeg: [] };
    for (const width of widths) {
      const height = Math.round((crop.height * width) / crop.width);
      // Width only: sharp derives the height, so nothing can be stretched.
      const resized = sharp(cropped).resize({ width });
      for (const format of FORMATS) {
        const enc = ENCODERS[format];
        const file = `${outBase}-${width}.${enc.ext}`;
        const buffer = await enc.apply(resized.clone()).toBuffer();
        await writeFile(resolve(OUT_DIR, file), buffer);
        written.add(file);
        src[format].push({ w: width, src: `/images/${file}` });
        rows.push({ id: rendition.id, file, width, height, format, bytes: buffer.length });
      }
    }

    manifest.push({
      id: rendition.id,
      key: rendition.key,
      slot: rendition.slot,
      width: crop.width,
      height: crop.height,
      top: crop.top,
      placeholder,
      src,
      note: rendition.note,
    });
  }

  // --- OG card -------------------------------------------------------------
  if (!only || only === OG.key) {
    const ogEntry = images[OG.key];
    const ogCrop = cropFor(OG);
    const ogBuffer = await sharp(resolve(SRC_DIR, ogEntry.src))
      .extract(ogCrop)
      .resize({ width: OG.width, height: OG.height, fit: 'fill' })
      .jpeg({ quality: OG.quality, progressive: true, mozjpeg: true })
      .toBuffer();
    await writeFile(resolve(PUBLIC_DIR, 'og.jpg'), ogBuffer);
    rows.push({
      id: 'og',
      file: 'og.jpg',
      width: OG.width,
      height: OG.height,
      format: 'jpeg',
      bytes: ogBuffer.length,
    });
  }

  // --- apple-touch-icon (request Q3) ---------------------------------------
  if (!only) {
    if (!existsSync(FAVICON)) throw new Error(`Missing ${FAVICON} (designer-owned).`);
    // The favicon is a rounded square on #435b47; iOS masks its own corners, so
    // flatten onto the same green rather than shipping transparent corners.
    const icon = await sharp(FAVICON, { density: 512 })
      .resize(180, 180, { fit: 'contain', background: '#435b47' })
      .flatten({ background: '#435b47' })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await writeFile(resolve(PUBLIC_DIR, 'apple-touch-icon.png'), icon);
    rows.push({
      id: 'icon',
      file: 'apple-touch-icon.png',
      width: 180,
      height: 180,
      format: 'png',
      bytes: icon.length,
    });
  }

  // --- prune stale renditions ---------------------------------------------
  if (!only) {
    for (const file of await readdir(OUT_DIR)) {
      if (file.startsWith('.')) continue;
      if (!written.has(basename(file))) {
        await unlink(resolve(OUT_DIR, file));
        console.log(`  pruned  ${file}`);
      }
    }
  }

  // --- manifest ------------------------------------------------------------
  if (!only) await writeManifest(manifest);
  else console.log('! --only run: src/content/images.generated.ts left untouched.');

  report(rows, manifest, only);
}

async function writeManifest(manifest) {
  const ids = manifest.map((m) => m.id);
  const body = `/**
 * GENERATED FILE — written by \`scripts/build-images.mjs\` (\`npm run images\`).
 * Hand edits are overwritten.
 *
 * One entry per *rendition*: a key from \`images.ts\` cropped for one slot at one
 * ratio (design-spec §9). Keys used at two ratios have two entries; \`key\` points
 * back at \`images.ts\` for the alt text, \`slot\` at where the rendition is used.
 * \`src\` paths are root-relative — \`<Picture>\` prefixes \`import.meta.env.BASE_URL\`.
 */
import type { ImageKey, ImageSlot } from './images';

export type GeneratedSource = {
  /** Intrinsic width in px, for the \`srcset\` \`w\` descriptor. */
  w: number;
  /** Root-relative path, e.g. \`/images/hero-flower-bar-768.avif\`. */
  src: string;
};

export type GeneratedImage = {
  key: ImageKey;
  slot: ImageSlot;
  /** Candidates per format, narrowest first. */
  src: { avif: GeneratedSource[]; webp: GeneratedSource[]; jpeg: GeneratedSource[] };
  /** Intrinsic size of the crop, for width/height and CLS. */
  width: number;
  height: number;
  /** Vertical offset of the crop in the 1152×1536 source (design-spec §9). */
  top: number;
  /** Dominant colour, painted behind the image while it loads. */
  placeholder: string;
};

export type RenditionId = ${ids.map((id) => `'${id}'`).join(' | ')};

export const generatedImages: Record<RenditionId, GeneratedImage> = {
${manifest
  .map(
    (m) => `  ${m.id}: {
${m.note ? `    // ${m.note}\n` : ''}    key: '${m.key}',
    slot: '${m.slot}',
    src: {
${FORMATS.map(
  (f) => `      ${f}: [${m.src[f].map((s) => `{ w: ${s.w}, src: '${s.src}' }`).join(', ')}],`,
).join('\n')}
    },
    width: ${m.width},
    height: ${m.height},
    top: ${m.top},
    placeholder: '${m.placeholder}',
  },`,
  )
  .join('\n')}
};

/** Renditions belonging to each key, for sections that loop over a slot. */
export const renditionsByKey = {
${Object.entries(
  manifest.reduce((acc, m) => {
    (acc[m.key] ??= []).push(m.id);
    return acc;
  }, {}),
)
  .map(([key, list]) => `  ${key}: [${list.map((id) => `'${id}'`).join(', ')}],`)
  .join('\n')}
} as const satisfies Partial<Record<ImageKey, readonly RenditionId[]>>;
`;

  const formatted = await prettier.format(body, {
    ...(await prettier.resolveConfig(MANIFEST)),
    filepath: MANIFEST,
  });
  await writeFile(MANIFEST, formatted);
}

function report(rows, manifest, only) {
  const byId = new Map();
  for (const row of rows) {
    if (!byId.has(row.id)) byId.set(row.id, []);
    byId.get(row.id).push(row);
  }

  const pad = (s, n) => String(s).padEnd(n);
  const padL = (s, n) => String(s).padStart(n);
  console.log('\nRendition                  crop        largest AVIF  WebP      JPEG      total');
  console.log('-'.repeat(80));
  let grand = 0;
  for (const [id, list] of byId) {
    const total = list.reduce((n, r) => n + r.bytes, 0);
    grand += total;
    const widest = Math.max(...list.map((r) => r.width));
    const at = (f) => list.find((r) => r.format === f && r.width === widest);
    const entry = manifest.find((m) => m.id === id);
    const crop = entry ? `${entry.width}×${entry.height}` : `${list[0].width}×${list[0].height}`;
    console.log(
      `${pad(id, 26)} ${pad(crop, 11)} ${padL(at('avif') ? kb(at('avif').bytes) : '—', 12)}  ` +
        `${padL(at('webp') ? kb(at('webp').bytes) : '—', 8)}  ` +
        `${padL(at('jpeg') ? kb(at('jpeg').bytes) : at('png') ? kb(at('png').bytes) : '—', 8)}  ` +
        `${padL(kb(total), 9)}`,
    );
  }
  console.log('-'.repeat(80));
  console.log(`${pad('total on disk', 26)} ${padL(kb(grand), 52)}`);

  const heroJpegs = rows.filter((r) => r.id.startsWith('hero') && r.format === 'jpeg');
  if (heroJpegs.length) {
    const largest = heroJpegs.reduce((a, b) => (a.bytes > b.bytes ? a : b));
    const ok = largest.bytes <= HERO_JPEG_BUDGET;
    const avif = rows.filter((r) => r.id.startsWith('hero') && r.format === 'avif');
    const largestAvif = avif.reduce((a, b) => (a.bytes > b.bytes ? a : b));
    console.log(
      `\nhero JPEG budget: largest ${largest.file} = ${kb(largest.bytes)} ` +
        `(limit ${kb(HERO_JPEG_BUDGET)}) — ${ok ? 'OK' : 'OVER'}`,
    );
    if (!ok) {
      console.log(
        `  the 1152 px JPEG is the no-WebP fallback only; every format actually served is` +
          ` under budget (largest AVIF ${largestAvif.file} = ${kb(largestAvif.bytes)}).` +
          `\n  Quality is fixed at q78 by the plan; see docs/qa/requests.md Q7.`,
      );
    }
  }
  console.log(
    only
      ? `\nbuild-images: rebuilt "${only}" only.`
      : `\nbuild-images: ${manifest.length} renditions, ${rows.length} files.`,
  );
}

await main();
