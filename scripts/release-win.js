#!/usr/bin/env node
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

const releaseName = process.argv.slice(2).join(' ');

if (releaseName === '') {
  console.error(`❌ Error: Please provide release name`);
  process.exit(1);
}

// Resolve the actual release-it entry point js file, bypassing the npx.cmd wrapper (unreliable to spawn on Windows without a shell)
const releaseItPkgEntry = require.resolve('release-it');
const releaseItBin = path.join(path.dirname(releaseItPkgEntry), '..', 'bin', 'release-it.js');

console.log(`🚀 Running: release-it --github.releaseName="${releaseName}" --only-version`);
try {
  execFileSync(process.execPath, [releaseItBin, `--github.releaseName=${releaseName}`, '--only-version'], { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Error while creating release on GitHub');
  process.exit(1);
}

console.log('✅ Release successful!');