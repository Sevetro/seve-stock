#!/usr/bin/env node
import readline from "readline";
import fs from "fs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const releaseName = await ask("Enter release name: ");
  const releaseNotes = await ask("Enter release notes: ");

  fs.writeFileSync("release-info.json", JSON.stringify({ releaseName, releaseNotes }));

  rl.close();
}

main();