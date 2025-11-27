#!/usr/bin/env node
import { execSync } from 'child_process';

const releaseName = process.argv[2];

if (releaseName === undefined) {
  console.error(`❌ Error: Please provide release name`);
  process.exit(1);
}


const releaseCmd = `npx release-it --github.releaseName=${releaseName} --only-version`;
console.log(`🚀 Running: ${releaseCmd}`);
try {
  execSync(releaseCmd, { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Error while creating release on GitHub');
  process.exit(1);
}

console.log('✅ Release successful!');