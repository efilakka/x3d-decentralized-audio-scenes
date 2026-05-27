# Multi-Source Spatial Audio Navigation Scene — chunked scenes (IPFS pipeline)

Progressive X3D loading for the Web3D paper: content-addressed chunks, verify-before-bind, LOD.

## Layout

| Path | Role |
|------|------|
| `shell.x3d` | Environment, audio graph, camera tour, floor, platforms |
| `sources/source-N-lod0.x3d` | Placeholder geometry (fast first paint) |
| `sources/source-N-lod1.x3d` | Full sculpture + label |
| `manifest.json` | Paths + SHA-256 (run `node scripts/build-manifest.mjs`) |

## Steps (development)

1. **Chunking** (this folder) — split scene; baseline demo: `MultiSourceSpatialAudioNavigationScene_XITE.xhtml`. **Done**
2. **Manifest + verify** — `js/verifiedSceneLoader.js`, load chunks from `/scenes/` with hash check. **Done**
3. **Wire demo page** — `MultiSourceSpatialAudioNavigationScene_Streamed.xhtml` with shell `Inline` + loader on load.
4. **IPFS pinning** — Pinata upload; root CID + gateway URLs in manifest. **Done**
5. **On-chain anchor** — Sepolia contract stores manifest root CID. **Done**
6. **Verify-Before-Bind** — `js/verifiedSceneLoader.js` + streamed demo page. **Done**
7. **Progressive LOD** — manual LOD upgrade buttons; distance-based upgrade planned.
8. **Metrics** — load timings in streamed page panel. **Done**

## Regenerate hashes

```bash
node scripts/build-manifest.mjs
```

Requires Node.js 18+.

## Step 2 API (`js/verifiedSceneLoader.js`)

```javascript
// After <x3d-canvas> loads shell (Inline url="scenes/shell.x3d" or embedded)
var canvas = document.querySelector('x3d-canvas');
var result = await VerifiedSceneLoader.loadAllSourcesLod0(canvas, {
  manifestUrl: 'scenes/manifest.json',
  scenesBaseUrl: 'scenes/'
});
// result.loads[].loadMs — per-chunk timing (for Step 6 metrics)
await VerifiedSceneLoader.upgradeSourceLod1(canvas, result.manifest, 'scenes/', 1);
```

IPFS (Step 4): set `scenesBaseUrl` to `VerifiedSceneLoader.ipfsBaseFromManifest(manifest)` when `ipfs.rootCid` is filled.

## Paper trade-offs (design notes)

| Knob | Finer chunks (per source × LOD) | Coarser chunks (whole scene) |
|------|----------------------------------|------------------------------|
| **First paint** | Fast: parallel lod0 (~350 B each) | Slow: wait for full shell |
| **Verify cost** | 9× SHA-256 (cheap in browser) | 1× hash, larger download risk |
| **IPFS pinning** | Pin only changed sculptures | Re-pin entire asset on any edit |
| **On-chain gas** | Anchor **manifest root** only (1 CID → chunk table) | Same, but manifest grows with monolith updates |
| **Trust** | Per-chunk mismatch blocks mount (verify-before-bind) | Single hash; sub-part tampering harder to detect |

**Recommendation for this demo:** manifest root CID on-chain (optional Sepolia); per-chunk `sha256` in manifest off-chain; stream lod0 → distance-based lod1 upgrade.
