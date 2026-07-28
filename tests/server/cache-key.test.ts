import { describe, expect, it } from 'vitest';
import { publicCacheUrl } from '../../src/lib/server/cache-key';

describe('publicCacheUrl', () => {
  it('removes advertising identifiers while preserving functional parameters', () => {
    expect(
      publicCacheUrl(
        'https://dpflab.ee/en?utm_source=meta&fbclid=click&campaign_id=123&preview=compact'
      )
    ).toBe('https://dpflab.ee/en?preview=compact');
  });

  it('sorts remaining query parameters for a stable cache key', () => {
    expect(publicCacheUrl('https://dpflab.ee/?z=2&a=1')).toBe(
      'https://dpflab.ee/?a=1&z=2'
    );
  });
});
