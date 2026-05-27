/**
 * set-ipfs-cids.mjs
 * Fetch per-file CIDs from Pinata API for the uploaded scenes/ folder,
 * then write them back into scenes/manifest.json.
 *
 * Usage:
 *   node scripts/set-ipfs-cids.mjs <ROOT_CID> <PINATA_JWT>
 *
 * Example:
 *   node scripts/set-ipfs-cids.mjs bafybeiezii7usczjpsu3wcil52rdua5ef7j4k75fisrjqmto77z2ctrvvu eyJhbGci...
 *
 * The Pinata JWT can be created at:
 *   https://app.pinata.cloud/developers/api-keys
 *   Permissions needed: pinList (read) — a read-only key is sufficient.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_CID  = process.argv[2];
const JWT       = process.argv[3];

if (!ROOT_CID) {
  console.error('Usage: node scripts/set-ipfs-cids.mjs <ROOT_CID> [PINATA_JWT]');
  process.exit(1);
}

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, '..', 'scenes', 'manifest.json');

// ── 1. Load manifest ──────────────────────────────────────────────────────────
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

// ── 2. Set root CID & preferred gateway ──────────────────────────────────────
manifest.ipfs.rootCid  = ROOT_CID;
manifest.ipfs.gateway  = 'https://gateway.pinata.cloud/ipfs/';
manifest.ipfs.pinnedAt = new Date().toISOString();

// ── 3. Build per-chunk gateway URLs from root CID + relative path ─────────────
//  IPFS UnixFS directory traversal: <rootCID>/<relative-path>
//  Per-file CIDs require either the Pinata API or a local ipfs CLI.
//  If a JWT is provided we query the Pinata Files API; otherwise we store null
//  and note that path-based access via rootCID is sufficient for verification.

const PINATA_FILES_API = 'https://api.pinata.cloud/v3/files';

async function fetchPerFileCids(jwt, rootCid) {
  // Pinata stores each uploaded file; query by group/name to match our paths.
  // We iterate pages until we find all 9 chunks.
  const cidMap = {};
  let pageToken = null;
  let page = 1;

  while (true) {
    const url = new URL(PINATA_FILES_API);
    url.searchParams.set('limit', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    if (!res.ok) {
      console.warn(`Pinata API error ${res.status} — per-file CIDs will be null`);
      return null;
    }

    const body = await res.json();
    const files = body.data?.files || body.items || [];

    for (const f of files) {
      const name = f.name || f.ipfs_pin_hash;
      // Match files whose name ends with one of our chunk relative paths
      for (const chunkPath of Object.keys(manifest.chunks)) {
        const basename = path.basename(chunkPath);
        if (name === basename || name.endsWith('/' + basename) || name === chunkPath) {
          cidMap[chunkPath] = f.cid || f.ipfs_pin_hash;
        }
      }
    }

    pageToken = body.data?.next_page_token || body.nextPageToken || null;
    if (!pageToken || files.length === 0) break;
    page++;
    if (page > 20) break; // safety
  }

  return cidMap;
}

let perFileCids = null;
if (JWT) {
  console.log('Querying Pinata API for per-file CIDs…');
  perFileCids = await fetchPerFileCids(JWT, ROOT_CID);
  if (perFileCids) {
    console.log('Found', Object.keys(perFileCids).length, 'per-file CIDs from API');
  }
} else {
  console.log('No JWT provided — per-file CIDs will be derived from root (path-based access).');
}

// ── 4. Update chunk entries ───────────────────────────────────────────────────
const BASE_URL = `${manifest.ipfs.gateway}${ROOT_CID}/`;

for (const [chunkPath, entry] of Object.entries(manifest.chunks)) {
  // Per-file CID if available from API, otherwise null (path access still works)
  entry.ipfsCid    = perFileCids ? (perFileCids[chunkPath] || null) : null;
  // Canonical IPFS URL for this chunk (path-based under root CID)
  entry.ipfsUrl    = BASE_URL + chunkPath;
}

// ── 5. Write updated manifest ─────────────────────────────────────────────────
manifest.ipfs.updatedAt = new Date().toISOString();
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log('\n✅  manifest.json updated');
console.log('   rootCid :', ROOT_CID);
console.log('   gateway :', manifest.ipfs.gateway);
console.log('\nSample gateway URL:');
console.log('  ', BASE_URL + 'shell.x3d');
console.log('\nTest in browser:');
console.log('  ', BASE_URL + 'sources/source-1-lod0.x3d');
