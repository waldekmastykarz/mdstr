# Copilot Instructions

## Project Overview

`mdstr` is a zero-dependency CLI (beyond `commander`) that converts markdown to a JSON-safe string via `JSON.stringify`. Two-layer architecture:

- **`bin/mdstr.js`** — CLI entry point (argument parsing, stdin reading, error handling)
- **`lib/escape.js`** — Core logic (`escapeMarkdown`, `readFile`, `EscapeError`)

All business logic belongs in `lib/`; `bin/` is exclusively CLI wiring.

## Conventions

- **CommonJS** (`require`/`module.exports`) — the project uses `"type": "commonjs"`
- **`'use strict'`** at the top of every JS file
- **No dev dependencies** — the project deliberately avoids them
- Custom `EscapeError` class carries an `exitCode` property. Exit codes: `0` success, `1` read/conversion error, `2` invalid usage (file not found, no input)
- Errors go to stderr (`console.error`), data to stdout (`process.stdout.write`)
- Trailing newline is stripped by default; `--preserve-newline` keeps it

## Testing

Uses **Node.js built-in test runner** — no test framework:

```bash
npm test  # runs: node --test 'test/**/*.test.js'
```

Tests are **CLI integration tests** that shell out via `execFileSync` to the actual binary. The `run()` helper in `test/escape.test.js` is the pattern to follow — it handles both success and error cases, returning `{ stdout, stderr, exitCode }`.

Test fixtures live in `test/fixtures/`. When adding features, add a fixture file if the test needs file input, or use the `input` option for stdin testing.

## Build & Release

- No build step — source ships directly
- CI (`ci.yml`) runs tests on Node 20, 22, 24 on PRs to `main`
- Publishing (`publish.yml`) triggers on `v*` tags via `npm publish --access public`
- `prepublishOnly` runs tests before publish
- Version bumping follows the skill in `.github/skills/bump-version/SKILL.md`
- Changelog follows [Keep a Changelog](https://keepachangelog.com/) format

## Adding Features

1. Put core logic in `lib/escape.js`, export it
2. Wire CLI flags/arguments in `bin/mdstr.js` using `commander`
3. Add integration tests that invoke the CLI binary
4. Update `--help` text in `bin/mdstr.js` (examples, exit codes sections)
5. Add entry under `## [Unreleased]` in `CHANGELOG.md`
