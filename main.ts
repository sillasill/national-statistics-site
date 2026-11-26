// Hand-in program for the national statistics site entry (Node 22,
// standard library only). The site lives in app/ next to this file and
// its screenshots in screenshots/. This program copies both into the
// output directory — /output on the grader, or MAKEFUN_OUTPUT_DIR
// elsewhere — and writes dossier.json there, the summary the judge
// reads, built by the vendored make.fun library. The library file
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it:
// the scorer rebuilds the dossier with its own copy and compares bytes.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const entryDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appSource = join(entryDir, 'app');
const appTarget = join(outputDir, 'app');
const shotsSource = join(entryDir, 'screenshots');
const shotsTarget = join(outputDir, 'screenshots');

mkdirSync(outputDir, { recursive: true });
cpSync(appSource, appTarget, { recursive: true });
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

// Caps mirror the gate so a too-big entry is refused here first:
// at most 4 screenshots of 256 KiB, app/ under 993 entries and 16 MiB,
// and the dossier text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
