#!/usr/bin/env node
import { execSync } from 'child_process';

const versionArg = process.argv[2] ?? "";

function isSemver(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

const validBumps = ['patch', 'minor', 'major'];

// if (!versionArg) {
//   console.error('❌ Error: you need to provide one of following arguments - patch, minor, major or exact version X.Y.Z');
//   process.exit(1);
// }

if (!validBumps.includes(versionArg) && !isSemver(versionArg)) {
  console.error(`❌ Error: invalid argument "${versionArg}". Allowed: patch, minor, major or X.Y.Z`);
  process.exit(1);
}

const releaseCmd = `npx release-it ${versionArg}`;
console.log(`🚀 Running: ${releaseCmd}`);
try {
  execSync(releaseCmd, { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Error while creating release on GitHub');
  process.exit(1);
}

console.log('✅ Release successful!');