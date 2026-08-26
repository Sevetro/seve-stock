# Seve Stock

Desktop application for analyzing Warsaw Stock Exchange (GPW) companies with Yahoo Finance data.

## Requirements

- Node.js 22 or newer
- npm
- Windows for Windows installer builds

## Development

```powershell
npm install
npm run dev
```

`npm run dev` starts the Vite renderer, recompiles Electron, and watches SCSS module type definitions.

## Quality Checks

```powershell
npm run lint
npm test
npm run build
```

- `lint` runs ESLint.
- `test` runs deterministic Vitest fixture tests without network access.
- `build` regenerates ignored SCSS module declarations, type-checks the projects, and builds the production renderer.

GitHub Actions runs these checks for pushes and pull requests. Protect `main` with the `CI / verify` required status check to prevent merging a failing pull request.

## Yahoo Finance Diagnostics

```powershell
npm run diagnose:yahoo
npm run diagnose:yahoo -- BHW.WA PZU.WA
```

The diagnostic queries live Yahoo `fundamentalsTimeSeries`, `quoteSummary`, `chart`, and `quote` endpoints. It is for investigating source-data changes and is not a CI gate because Yahoo Finance is unofficial and rate-limited.

A scheduled GitHub Actions workflow stores a daily JSON report as an artifact. It can also be run manually from the Actions tab.

## Release

```powershell
npm run release:win "v3.1.1"
```

The release workflow builds the Windows installer before it creates the release commit, tag, push, and GitHub Release. The installer is written to `dist/`.
