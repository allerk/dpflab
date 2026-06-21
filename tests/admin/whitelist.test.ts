import { describe, it, expect } from 'vitest';
import { parse, isWhitelisted } from '../../src/lib/server/admin/whitelist';

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

  it('splits comma-separated lists (env var format)', () => {
    const result = parse('alice@example.com, bob@example.com');
    expect(result.size).toBe(2);
  });
});

describe('isWhitelisted', () => {
  it('returns false when the whitelist is undefined', () => {
    expect(isWhitelisted('any@example.com', undefined)).toBe(false);
  });

  it('returns false when the whitelist is empty', () => {
    expect(isWhitelisted('any@example.com', '')).toBe(false);
  });

  it('returns true for a listed address (case-insensitive)', () => {
    expect(isWhitelisted('Alice@Example.COM', 'alice@example.com')).toBe(true);
  });

  it('returns false for an unlisted address', () => {
    expect(isWhitelisted('bob@example.com', 'alice@example.com')).toBe(false);
  });

  it('supports comma-separated lists', () => {
    expect(isWhitelisted('bob@example.com', 'alice@example.com, bob@example.com')).toBe(true);
  });
});
