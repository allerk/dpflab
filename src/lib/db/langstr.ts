export type LangStr = Record<string, string>;

const FALLBACK_LOCALE = 'ee';

export function makeLangStr(values: LangStr): string {
  return JSON.stringify(values);
}

export function getLang(raw: string, locale: string): string {
  const parsed = JSON.parse(raw) as LangStr;
  if (locale in parsed) return parsed[locale];
  if (FALLBACK_LOCALE in parsed) return parsed[FALLBACK_LOCALE];
  const firstKey = Object.keys(parsed)[0];
  return firstKey ? parsed[firstKey] : '';
}
