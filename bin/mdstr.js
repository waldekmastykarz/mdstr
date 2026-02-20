#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const { escapeMarkdown, readFile, EscapeError } = require('../lib/escape');
const { version } = require('../package.json');

program
  .name('mdstr')
  .version(version)
  .description('Convert markdown to a JSON-safe string')
  .argument('[file]', 'Path to a markdown file (reads from stdin if omitted)')
  .option('--preserve-newline', 'Keep trailing newline in output')
  .addHelpText('after', `
Examples:
  mdstr README.md                        Convert file to JSON string
  mdstr ./docs/guide.md                  Relative path
  cat notes.md | mdstr                   Pipe markdown via stdin
  echo '# "Hello" World' | mdstr        Inline markdown via stdin
  mdstr README.md --preserve-newline     Keep trailing newline

  $ echo '# "Hello" World' | mdstr
  "# \\"Hello\\" World"

Output:
  A valid JSON string (with surrounding quotes), written to stdout.
  The output can be embedded directly as a JSON value:
    jq -n --argjson c "$(mdstr file.md)" '{content: $c}'

Auth:
  None required.

Exit codes:
  0  Success
  1  Read/conversion error
  2  Invalid usage (file not found, no input)

Notes:
  Strips trailing newline by default (use --preserve-newline to keep).
  Output to stdout; errors to stderr.
  Reads from stdin when no file argument is given and stdin is not a TTY.`)
  .action(async (file, options) => {
    try {
      let content;

      if (file) {
        content = readFile(file);
      } else if (!process.stdin.isTTY) {
        content = await readStdin();
      } else {
        program.help();
      }

      const result = escapeMarkdown(content, {
        preserveNewline: options.preserveNewline
      });
      process.stdout.write(result + '\n');
    } catch (err) {
      if (err instanceof EscapeError) {
        console.error(`Error: ${err.message}`);
        process.exit(err.exitCode);
      }
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(chunks.join('')));
    process.stdin.on('error', reject);
  });
}

program.parse();
