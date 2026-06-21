import { extname } from 'node:path';

export const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif'
};

export const ALLOWED_EXT = new Set(Object.keys(MIME));

export function contentTypeFor(filename: string): string | undefined {
  return MIME[extname(filename).toLowerCase()];
}

/**
 * Lists image object keys from the R2 bucket. R2 `list` is paginated, so we
 * follow the cursor until the result is no longer truncated.
 */
export async function listImages(platform: App.Platform | undefined): Promise<string[]> {
  const bucket = platform?.env?.BUCKET;
  if (!bucket) return [];

  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ cursor });
    for (const obj of listed.objects) {
      if (ALLOWED_EXT.has(extname(obj.key).toLowerCase())) keys.push(obj.key);
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  return keys.sort();
}
