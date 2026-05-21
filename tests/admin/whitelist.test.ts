import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse } from '../../src/lib/server/admin/whitelist';

describe('parse', () => {
  it('returns emails in lowercase', () => {
    const result = parse('Alice@Example.COM\n');
    expect(result.has('alice@example.com')).toBe(true);
  });

  it('ignores #-prefixed comment lines', () => {
    const result = parse('# admin\nalice@example.com\n');
    expect(result.has('alice@example.com')).toBe(true);
    expect(result.size).toBe(1);
  });

  it('ignores blank lines', () => {
    const result = parse('\n\nalice@example.com\n\n');
    expect(result.size).toBe(1);
  });

  it('trims surrounding whitespace', () => {
    const result = parse('  alice@example.com  \n');
    expect(result.has('alice@example.com')).toBe(true);
  });

  it('deduplicates case-insensitive entries', () => {
    const result = parse('Alice@example.com\nalice@EXAMPLE.COM\n');
    expect(result.size).toBe(1);
  });

  it('returns empty set for empty input', () => {
    expect(parse('').size).toBe(0);
    expect(parse('# comment only\n').size).toBe(0);
  });

  it('handles multiple valid addresses', () => {
    const result = parse('alice@example.com\nbob@example.com\n');
    expect(result.has('alice@example.com')).toBe(true);
    expect(result.has('bob@example.com')).toBe(true);
    expect(result.size).toBe(2);
  });
});

describe('isWhitelisted (via temp file)', () => {
  let tmpFile: string;
  const orig = process.env.ADMIN_WHITELIST_PATH;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `whitelist-test-${Date.now()}.txt`);
    process.env.ADMIN_WHITELIST_PATH = tmpFile;
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    if (orig === undefined) delete process.env.ADMIN_WHITELIST_PATH;
    else process.env.ADMIN_WHITELIST_PATH = orig;
    // Reset the module cache so the next test starts fresh
  });

  it('returns false when the file is missing', async () => {
    const { isWhitelisted } = await import('../../src/lib/server/admin/whitelist?t=' + Date.now());
    expect(isWhitelisted('any@example.com')).toBe(false);
  });

  it('returns true for a listed address (case-insensitive)', async () => {
    fs.writeFileSync(tmpFile, 'alice@example.com\n');
    const { isWhitelisted } = await import('../../src/lib/server/admin/whitelist?t=' + Date.now());
    expect(isWhitelisted('Alice@Example.COM')).toBe(true);
  });

  it('returns false for an unlisted address', async () => {
    fs.writeFileSync(tmpFile, 'alice@example.com\n');
    const { isWhitelisted } = await import('../../src/lib/server/admin/whitelist?t=' + Date.now());
    expect(isWhitelisted('bob@example.com')).toBe(false);
  });
});
