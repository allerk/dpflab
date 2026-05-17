import { describe, it, expect } from 'vitest';
import { makeLangStr, getLang } from '../../src/lib/db/langstr';

describe('makeLangStr', () => {
  it('serializes a translation map to JSON', () => {
    const raw = makeLangStr({ ee: 'Tere', ru: 'Привет' });
    expect(JSON.parse(raw)).toEqual({ ee: 'Tere', ru: 'Привет' });
  });

  it('handles an empty map', () => {
    expect(makeLangStr({})).toBe('{}');
  });
});

describe('getLang', () => {
  it('returns the value for the requested locale', () => {
    const raw = makeLangStr({ ee: 'Tere', ru: 'Привет' });
    expect(getLang(raw, 'ee')).toBe('Tere');
    expect(getLang(raw, 'ru')).toBe('Привет');
  });

  it("falls back to 'ee' when the requested locale is missing", () => {
    const raw = makeLangStr({ ee: 'Tere', ru: 'Привет' });
    expect(getLang(raw, 'fi')).toBe('Tere');
  });

  it("falls back to the first key when both the locale and 'ee' are missing", () => {
    const raw = makeLangStr({ ru: 'Привет', fi: 'Hei' });
    expect(getLang(raw, 'en')).toBe('Привет');
  });

  it('returns empty string when the map is empty', () => {
    expect(getLang('{}', 'ee')).toBe('');
  });
});
