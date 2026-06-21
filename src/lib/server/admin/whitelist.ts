import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PATH = './config/admin-whitelist.txt';

interface Cache {
  emails: Set<string>;
  mtimeMs: number;
}

let _cache: Cache | null = null;

export function parse(content: string): Set<string> {
  const result = new Set<string>();
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    result.add(line.toLowerCase());
  }
  return result;
}

function load(): Set<string> {
  const filePath = path.resolve(process.env.ADMIN_WHITELIST_PATH ?? DEFAULT_PATH);
  try {
    const { mtimeMs } = fs.statSync(filePath);
    if (!_cache || _cache.mtimeMs !== mtimeMs) {
      _cache = { emails: parse(fs.readFileSync(filePath, 'utf-8')), mtimeMs };
    }
    return _cache.emails;
  } catch {
    console.warn(`[admin] whitelist unreadable: ${filePath}`);
    return new Set();
  }
}

export function isWhitelisted(email: string): boolean {
  return load().has(email.trim().toLowerCase());
}
