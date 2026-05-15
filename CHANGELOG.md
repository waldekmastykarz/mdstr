# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-05-15

### Changed

- Minimum Node.js version is now 22 (Node.js 20 reached EOL on April 30, 2026)

## [0.1.0] - 2026-02-20

### Added

- Convert markdown file to JSON-safe string via positional argument
- Read markdown from stdin when no file argument is given
- Strip trailing newline by default (`--preserve-newline` to keep)
- Self-contained `--help` with examples, exit codes, and output format
- Errors to stderr, data to stdout
