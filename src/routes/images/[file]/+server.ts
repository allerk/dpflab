import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';
import type { RequestHandler } from './$types';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif'
};

export const GET: RequestHandler = async ({ params }) => {
  // Prevent path traversal — basename strips any directory component
  const filename = basename(params.file);
  const ext = extname(filename).toLowerCase();
  const mime = MIME[ext];

  if (!mime) error(404, 'Not found');

  const filePath = resolve(process.cwd(), 'data/images', filename);

  let data: Buffer;
  try {
    data = await readFile(filePath);
  } catch {
    error(404, 'Not found');
  }

  return new Response(data, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};
