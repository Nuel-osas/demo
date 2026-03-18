/**
 * Minimal gRPC Streaming Demo
 *
 * This is the simplest possible example of streaming checkpoints from Sui.
 * No wrapper class, no abstractions — just raw gRPC.
 *
 * Setup:
 *   1. npm install @grpc/grpc-js @grpc/proto-loader
 *   2. Get proto files: git clone https://github.com/MystenLabs/sui-apis.git --depth=1
 *      mkdir -p protos && cp -r sui-apis/proto/* protos/ && rm -rf sui-apis
 *   3. Run: npx ts-node stream.ts
 *
 * Run: npx ts-node stream.ts
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

// ========================================
// STEP 1: Load the proto file
// ========================================
// Proto files are the "menu" — they tell the client what methods exist
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../protos/sui/rpc/v2/subscription_service.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [path.join(__dirname, '../protos')],
  }
);

// ========================================
// STEP 2: Create the client
// ========================================
// Get the SubscriptionService from the loaded proto
const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const SubscriptionService = proto.sui.rpc.v2.SubscriptionService;

// Connect to Sui testnet (free, no auth)
const client = new SubscriptionService(
  'fullnode.testnet.sui.io:443',
  grpc.credentials.createSsl()
);

// ========================================
// STEP 3: Subscribe to checkpoints
// ========================================
// Tell the node: "send me every new checkpoint, but only these fields"
const stream = client.SubscribeCheckpoints(
  {
    read_mask: {
      paths: ['sequence_number', 'digest', 'summary.timestamp', 'summary.epoch'],
    },
  },
  new grpc.Metadata()
);

console.log('Streaming live checkpoints from Sui testnet...\n');

let count = 0;

// ========================================
// STEP 4: Listen for data
// ========================================
// This fires every ~1-2 seconds when a new checkpoint is created on-chain
stream.on('data', (data: any) => {
  count++;
  const cp = data.checkpoint;

  // Parse the timestamp
  let time = '';
  if (cp.summary?.timestamp?.seconds) {
    time = new Date(parseInt(cp.summary.timestamp.seconds) * 1000).toLocaleTimeString();
  }

  console.log(
    `#${count} | Seq: ${cp.sequence_number} | Epoch: ${cp.summary?.epoch} | Time: ${time} | Digest: ${cp.digest?.slice(0, 12)}...`
  );
});

stream.on('error', (err: any) => {
  console.error('Stream error:', err.message);
});

stream.on('end', () => {
  console.log('\nStream ended.');
});

// ========================================
// STEP 5: Stop after 30 seconds
// ========================================
setTimeout(() => {
  console.log(`\nDone. Received ${count} checkpoints in 30 seconds.`);
  stream.cancel();
  grpc.closeClient(client);
  process.exit(0);
}, 30_000);
