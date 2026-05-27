/**
 * Build scenes/manifest.json with SHA-256 for each chunk (verify-before-bind).
 * Usage: node scripts/build-manifest.mjs
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const scenesDir = path.join(root, 'scenes');

const CHUNK_PATHS = [
  'shell.x3d',
  'sources/source-1-lod0.x3d',
  'sources/source-1-lod1.x3d',
  'sources/source-2-lod0.x3d',
  'sources/source-2-lod1.x3d',
  'sources/source-3-lod0.x3d',
  'sources/source-3-lod1.x3d',
  'sources/source-4-lod0.x3d',
  'sources/source-4-lod1.x3d',
];

async function sha256File(absPath) {
  const buf = await readFile(absPath);
  return createHash('sha256').update(buf).digest('hex');
}

const chunks = {};
for (const rel of CHUNK_PATHS) {
  const abs = path.join(scenesDir, rel);
  const sha256 = await sha256File(abs);
  chunks[rel.replace(/\\/g, '/')] = {
    path: rel.replace(/\\/g, '/'),
    sha256,
    bytes: (await readFile(abs)).length,
    ipfsCid: null,
  };
}

const sources = [
  { id: 1, name: 'Source 1 — The Caves of Moria', color: '#ff8000', def: 'Sculpture1' },
  { id: 2, name: 'Source 2 — The Caves of Khazad-dûm', color: '#33ccff', def: 'Sculpture2' },
  { id: 3, name: 'Source 3 — Tales of Samwise Gamgee', color: '#33ff33', def: 'Sculpture3' },
  { id: 4, name: 'Source 4 — The Glory of Gondor', color: '#ff33cc', def: 'Sculpture4' },
].map((s) => ({
  ...s,
  lod0: `sources/source-${s.id}-lod0.x3d`,
  lod1: `sources/source-${s.id}-lod1.x3d`,
}));

const manifest = {
  version: 1,
  title: 'Multi-Source Spatial Audio Navigation Scene',
  generatedAt: new Date().toISOString(),
  hashAlgorithm: 'sha256',
  shell: 'shell.x3d',
  mountPoint: 'StreamedSources',
  sources,
  chunks,
  ipfs: {
    rootCid: null,
    gateway: 'https://ipfs.io/ipfs/',
  },
  anchor: {
    network: null,
    contract: null,
    rootCid: null,
  },
};

const outPath = path.join(scenesDir, 'manifest.json');
await writeFile(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('Wrote', outPath);
console.log('Chunks:', Object.keys(chunks).length);
