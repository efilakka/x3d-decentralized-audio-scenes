# Verification Flow Diagram

## Current Implementation Status

```mermaid
flowchart TD
    subgraph BLOCKCHAIN["🔴 BLOCKCHAIN (Not Implemented Yet)"]
        style BLOCKCHAIN fill:#ffcccc,stroke:#cc0000
        BC1[/"Query Smart Contract<br/>0xeb62afe5..."/]
        BC2[/"Get On-Chain CID"/]
        BC3[/"Verify CID Match"/]
    end
    
    subgraph IPFS["🔴 IPFS FETCH (Not Implemented Yet)"]
        style IPFS fill:#ffcccc,stroke:#cc0000
        IP1[/"Fetch Manifest from<br/>IPFS Gateway"/]
    end
    
    subgraph IMPLEMENTED["✅ IMPLEMENTED"]
        style IMPLEMENTED fill:#ccffcc,stroke:#00cc00
        
        A[Page Loads] --> B[Load manifest.json<br/>FROM LOCAL FILE]
        B --> C[Parse Manifest]
        C --> D[For Each Chunk]
        
        D --> E[Fetch Chunk<br/>FROM LOCAL FILE]
        E --> F[Compute SHA-256 Hash]
        F --> G{Hash Match?}
        
        G -->|Yes| H[Mount Chunk<br/>to Scene]
        G -->|No| I[Reject Chunk ❌]
        
        H --> J{More Chunks?}
        J -->|Yes| D
        J -->|No| K[Scene Ready ✅]
        
        K --> L[Start Audio]
    end
    
    %% Connections that SHOULD exist but don't
    BC1 -.->|"Should connect"| BC2
    BC2 -.->|"Should connect"| BC3
    BC3 -.->|"Should connect"| IP1
    IP1 -.->|"Should replace"| B
```

## What's Working (Green)

| Step | Status | Description |
|------|--------|-------------|
| Load Manifest | ✅ | From local `scenes/manifest.json` |
| Fetch Chunks | ✅ | From local `scenes/sources/*.x3d` |
| SHA-256 Hash | ✅ | Computed for each chunk |
| Hash Verification | ✅ | Compared with manifest |
| Chunk Mounting | ✅ | Via X_ITE Inline nodes |
| LOD Upgrade | ✅ | LOD0 → LOD1 on demand |
| Audio | ✅ | Spatial audio working |

## What's NOT Working (Red)

| Step | Status | Description |
|------|--------|-------------|
| Query Blockchain | ❌ | Should read CID from Sepolia contract |
| IPFS Fetch | ❌ | Should load manifest from IPFS gateway |
| CID Verification | ❌ | Should verify IPFS CID matches on-chain |

## Full Trust Chain (Goal)

```
┌─────────────────┐
│   BLOCKCHAIN    │  Immutable source of truth
│  (Sepolia)      │  Contract: 0xeb62afe5...
└────────┬────────┘
         │ stores
         ▼
┌─────────────────┐
│   IPFS CID      │  Content-addressed identifier
│  bafybei...     │  
└────────┬────────┘
         │ points to
         ▼
┌─────────────────┐
│   MANIFEST      │  Contains SHA-256 hashes
│  manifest.json  │  for all chunks
└────────┬────────┘
         │ verifies
         ▼
┌─────────────────┐
│   CHUNKS        │  X3D scene fragments
│  source-*.x3d   │  Verified before mount
└─────────────────┘
```

## To Complete Blockchain Integration

Need to add:
1. **ethers.js** - To query Sepolia contract
2. **IPFS Gateway fetch** - To load manifest from Pinata
3. **CID comparison** - Verify fetched manifest matches on-chain CID

Estimated: ~30-50 lines of JavaScript
