/**
 * Admin whitelist now lives in the `ADMIN_WHITELIST` env var (Worker secret),
 * not on disk — Workers have no filesystem. Format: comma- or newline-separated
 * emails; `#` lines are treated as comments.
 */
export function parse(content: string): Set<string> {
  const result = new Set<string>();
  for (const raw of content.split(/[\n,]/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    result.add(line.toLowerCase());
  }
  return result;
}

export function isWhitelisted(email: string, whitelist: string | undefined): boolean {
  if (!whitelist) return false;
  return parse(whitelist).has(email.trim().toLowerCase());
}
