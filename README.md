# Decentralized Storage, Distribution and Verifiable Retrieval of X3D Spatial Audio Scenes

This repository contains the implementation for the Web3D 2026 paper demonstrating blockchain-anchored integrity verification for X3D 4.0 spatial audio scenes.

## Overview

The system implements a **verify-before-bind** progressive loading mechanism that ensures all scene content is cryptographically verified before being mounted into the X_ITE scene graph. Key features:

- **Decentralized Storage**: Scene chunks stored on IPFS with content-addressed retrieval
- **Blockchain Anchoring**: Root CID anchored on Ethereum Sepolia via ManifestAnchor smart contract
- **SHA-256 Verification**: Per-chunk cryptographic integrity verification
- **Progressive LOD**: Two-tier Level of Detail (LOD0/LOD1) streaming
- **X3D 4.0 Spatial Audio**: Full Audio Graph with SpatialSound, Gain, and AudioClip nodes

## Project Structure

```
├── verify.html                    # Verification gateway (blockchain + shell verification)
├── MultiSourceSpatialAudioNavigationScene_Streamed.xhtml  # Main scene (verify-before-bind)
├── MultiSourceSpatialAudioNavigationScene_XITE.xhtml      # Baseline scene (no verification)
├── benchmark.html                 # Performance benchmarking tool
├── architecture-diagram.html      # System architecture diagram
├── index.html                     # Entry point
│
├── scenes/
│   ├── manifest.json              # Chunk manifest with SHA-256 hashes
│   ├── shell.x3d                  # Scene shell (environment, audio graph, navigation)
│   └── sources/                   # LOD0/LOD1 geometry chunks
│
├── sound/                         # Audio assets
├── js/                            # JavaScript libraries
├── scripts/                       # Build scripts (manifest generation)
└── soundController_*.js           # Audio synchronization controllers
```

## Demo Pages

| Page | Description |
|------|-------------|
| `verify.html` | **Start here.** Verification gateway that validates blockchain CID and shell integrity before entering the scene. |
| `MultiSourceSpatialAudioNavigationScene_Streamed.xhtml` | Main scene with full verify-before-bind pipeline. Loads verified shell and LOD0 chunks. |
| `MultiSourceSpatialAudioNavigationScene_XITE.xhtml` | Baseline scene without verification (for comparison). |
| `benchmark.html` | Performance comparison tool measuring load times and SHA-256 overhead. |

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  BUILD PIPELINE │ ──→ │ DECENTRALIZED STORAGE│ ──→ │   CLIENT BROWSER    │
│                 │     │                      │     │                     │
│ X3D 4.0 Scene   │     │ IPFS (Pinata)        │     │ Query Blockchain    │
│ X_ITE Runtime   │     │ Content-Addressed    │     │ Fetch & Verify      │
│ LOD Chunking    │     │ Ethereum Sepolia     │     │ Progressive Load    │
└─────────────────┘     └──────────────────────┘     └─────────────────────┘

Trust chain: Blockchain → IPFS CID → Manifest → SHA-256 → Verified Scene
```

## Smart Contract

**ManifestAnchor** deployed on Sepolia Testnet:
- **Address**: `0xeb62afe54b4805eaec777b99d66959798afb9f76`
- **Root CID**: `bafybeiezii7usczjpsu3wcil52rdua5ef7j4k75fisrjqmto77z2ctrvvu`

## Running Locally

1. Serve from a local web server (e.g., XAMPP, Apache, or `python -m http.server`)
2. Open `verify.html` to start with blockchain verification
3. Or open `MultiSourceSpatialAudioNavigationScene_XITE.xhtml` for baseline (no verification)

## Benchmarking

Open `benchmark.html` to compare:
- **Baseline**: Direct loading without verification
- **Proposed**: Full verify-before-bind pipeline

Measured metrics:
- Time to First Geometry
- Total Load Time
- SHA-256 Overhead per chunk
- Blockchain Query Latency

## Technologies

- **X3D 4.0** — Declarative 3D with spatial audio nodes
- **X_ITE** — WebGL-based X3D browser
- **W3C Web Audio API** — Spatial audio rendering
- **IPFS** — Content-addressed decentralized storage
- **Ethereum** — On-chain manifest anchoring
- **ethers.js** — Blockchain interaction

## License

MIT License
