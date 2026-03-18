const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Downloading Sui proto files...\n');

execSync('git clone https://github.com/MystenLabs/sui-apis.git --depth=1', { stdio: 'inherit' });

fs.mkdirSync('protos', { recursive: true });

if (process.platform === 'win32') {
  execSync('xcopy sui-apis\\proto protos /E /I /Y', { stdio: 'inherit' });
  execSync('rmdir /s /q sui-apis', { stdio: 'inherit' });
} else {
  execSync('cp -r sui-apis/proto/* protos/', { stdio: 'inherit' });
  execSync('rm -rf sui-apis', { stdio: 'inherit' });
}

console.log('\nProto files ready in ./protos');
