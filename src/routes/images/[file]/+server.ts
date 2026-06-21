import { error } from '@sveltejs/kit';
import { basename } from 'node:path';
import { contentTypeFor } from '$lib/server/admin/images';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
  // Prevent path traversal — basename strips any directory component
  const filename = basename(params.file);
  const mime = contentTypeFor(filename);
  if (!mime) error(404, 'Not found');

  const bucket = platform?.env?.BUCKET;
  if (!bucket) error(404, 'Not found');

  const object = await bucket.get(filename);
  if (!object) error(404, 'Not found');

  // R2's ReadableStream (workers-types) is structurally the DOM stream at
  // runtime, but the two TS definitions differ — cast through BodyInit.
  return new Response(object.body as unknown as BodyInit, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      etag: object.httpEtag
    }
  });
};
