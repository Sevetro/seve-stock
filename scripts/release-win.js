#!/usr/bin/env node
import { execSync } from 'child_process';

const versionArg = process.argv[2] ?? "";

function isSemver(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

const validBumps = ['patch', 'minor', 'major'];

if (versionArg !== "" && !validBumps.includes(versionArg) && !isSemver(versionArg)) {
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