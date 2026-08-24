#!/usr/bin/env node
import { execFileSync } from 'child_process';

const releaseName = process.argv.slice(2).join(' ');

if (releaseName === '') {
  console.error(`❌ Error: Please provide release name`);
  process.exit(1);
}


console.log(`🚀 Running: npx release-it --github.releaseName="${releaseName}" --only-version`);
try {
  execFileSync('npx', ['release-it', `--github.releaseName=${releaseName}`, '--only-version'], { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Error while creating release on GitHub');
  process.exit(1);
}

console.log('✅ Release successful!');