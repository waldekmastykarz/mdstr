'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { execFileSync } = require('child_process');

const CLI = path.resolve(__dirname, '..', 'bin', 'mdstr.js');
const FIXTURES = path.resolve(__dirname, 'fixtures');

function run(args, opts = {}) {
  try {
    const result = execFileSync(process.execPath, [CLI, ...args], {
      encoding: 'utf-8',
      cwd: opts.cwd || __dirname,
      input: opts.input,
      timeout: 10000
    });
    return { stdout: result, exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status
    };
  }
}

describe('mdstr CLI', () => {
  describe('file input', () => {
    it('converts markdown file to JSON string', () => {
      const result = run([path.join(FIXTURES, 'sample.md')]);
      assert.equal(result.exitCode, 0);
      const output = result.stdout.trim();
      // Output should be a valid JSON string
      const parsed = JSON.parse(output);
      assert.equal(typeof parsed, 'string');
      assert.ok(parsed.includes('# Hello World'));
      assert.ok(parsed.includes('"quotes"'));
    });

    it('strips trailing newline by default', () => {
      const result = run([path.join(FIXTURES, 'sample.md')]);
      const parsed = JSON.parse(result.stdout.trim());
      assert.ok(!parsed.endsWith('\n'), 'should not end with newline');
    });

    it('preserves trailing newline with --preserve-newline', () => {
      const result = run([
        path.join(FIXTURES, 'sample.md'),
        '--preserve-newline'
      ]);
      const parsed = JSON.parse(result.stdout.trim());
      assert.ok(parsed.endsWith('\n'), 'should end with newline');
    });

    it('handles empty file', () => {
      const result = run([path.join(FIXTURES, 'empty.md')]);
      assert.equal(result.exitCode, 0);
      const parsed = JSON.parse(result.stdout.trim());
      assert.equal(parsed, '');
    });

    it('output is valid JSON', () => {
      const result = run([path.join(FIXTURES, 'sample.md')]);
      assert.doesNotThrow(() => JSON.parse(result.stdout.trim()));
    });

    it('preserves special characters', () => {
      const result = run([path.join(FIXTURES, 'sample.md')]);
      const parsed = JSON.parse(result.stdout.trim());
      assert.ok(parsed.includes('café'));
      assert.ok(parsed.includes('☕'));
      assert.ok(parsed.includes('\\'));
    });
  });

  describe('stdin input', () => {
    it('reads markdown from stdin', () => {
      const result = run([], { input: '# Hello\n\nWorld\n' });
      assert.equal(result.exitCode, 0);
      const parsed = JSON.parse(result.stdout.trim());
      assert.equal(parsed, '# Hello\n\nWorld');
    });

    it('handles multiline stdin', () => {
      const input = '# Title\n\n- item 1\n- item 2\n';
      const result = run([], { input });
      const parsed = JSON.parse(result.stdout.trim());
      assert.ok(parsed.includes('# Title'));
      assert.ok(parsed.includes('- item 1'));
    });
  });

  describe('error handling', () => {
    it('exits 2 for nonexistent file', () => {
      const result = run(['nonexistent.md']);
      assert.equal(result.exitCode, 2);
      assert.ok(result.stderr.includes('File not found'));
    });
  });

  describe('help and version', () => {
    it('shows help with --help', () => {
      const result = run(['--help']);
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.includes('Examples:'));
      assert.ok(result.stdout.includes('Exit codes:'));
    });

    it('shows version with --version', () => {
      const result = run(['--version']);
      assert.equal(result.exitCode, 0);
      assert.ok(result.stdout.trim().match(/^\d+\.\d+\.\d+$/));
    });

    it('help includes output format explanation', () => {
      const result = run(['--help']);
      assert.ok(result.stdout.includes('JSON string'));
    });
  });
});
