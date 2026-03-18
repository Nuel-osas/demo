# Sui gRPC Streaming Demo

A minimal example of streaming live checkpoints from the Sui blockchain using gRPC.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Get the official Sui proto files
npm run setup:protos

# 3. Run the stream
npm run stream
```

## What It Does

Connects to the Sui testnet via gRPC and streams live checkpoints as they're produced (~1-2 seconds apart). Each checkpoint shows:

- **Sequence number** — the checkpoint's position in the chain
- **Epoch** — the current epoch
- **Timestamp** — when it was created
- **Digest** — the checkpoint's unique hash

The stream runs for 30 seconds then stops.

## Expected Output

```
Streaming live checkpoints from Sui testnet...

#1 | Seq: 312513160 | Epoch: 1042 | Time: 11:50:10 AM | Digest: HEXhMb7ejz2J...
#2 | Seq: 312513161 | Epoch: 1042 | Time: 11:50:10 AM | Digest: 38TAncD2tTXr...
#3 | Seq: 312513162 | Epoch: 1042 | Time: 11:50:11 AM | Digest: 8LQvvesCF3Dx...
...

Done. Received 25 checkpoints in 30 seconds.
```

## How It Works (5 Steps)

```
Step 1: Load the proto file        → tells the client what methods exist
Step 2: Create the client           → connects to Sui testnet
Step 3: Subscribe to checkpoints    → "send me every new checkpoint"
Step 4: Listen for data             → fires every ~1-2 seconds
Step 5: Stop when done              → cancel the stream
```

The code is in `demo/stream.ts` — one file, ~90 lines, fully commented.

## Project Structure

```
streaming/
├── demo/
│   └── stream.ts       ← the streaming example
├── protos/              ← Sui proto files (created by setup:protos)
├── package.json
└── README.md
```
