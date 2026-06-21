import { readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const IMAGES_DIR = resolve(process.cwd(), 'data/images');
export const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);

export async function listImages(): Promise<string[]> {
  try {
    const files = await readdir(IMAGES_DIR);
    return files.filter((f) => ALLOWED_EXT.has(extname(f).toLowerCase())).sort();
  } catch {
    return [];
  }
}
