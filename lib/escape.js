'use strict';

const fs = require('fs');
const path = require('path');

class EscapeError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function escapeMarkdown(input, options = {}) {
  let content = input;

  // Strip trailing newline by default
  if (!options.preserveNewline && content.endsWith('\n')) {
    content = content.replace(/\n$/, '');
  }

  return JSON.stringify(content);
}

function readFile(filePath) {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new EscapeError(`File not found: ${filePath}`, 2);
  }

  try {
    return fs.readFileSync(resolved, 'utf-8');
  } catch (e) {
    throw new EscapeError(`Cannot read file: ${e.message}`);
  }
}

module.exports = { escapeMarkdown, readFile, EscapeError };
