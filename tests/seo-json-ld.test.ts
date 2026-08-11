import { describe, expect, it } from 'vitest';
import { renderJsonLdScript } from '../src/lib/seo/json-ld';

describe('renderJsonLdScript', () => {
  it('renders parseable JSON-LD', () => {
    const rendered = renderJsonLdScript({
      '@context': 'https://schema.org',
      '@type': 'AutomotiveBusiness',
      name: 'DPFLAB'
    });
    const payload = rendered.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');

    expect(JSON.parse(payload)).toMatchObject({
      '@type': 'AutomotiveBusiness',
      name: 'DPFLAB'
    });
  });

  it('cannot be terminated by editable text', () => {
    const rendered = renderJsonLdScript({ name: '</script><script>alert(1)</script>' });

    expect(rendered.match(/<script/g)).toHaveLength(1);
    expect(rendered).not.toContain('</script><script>');
    expect(rendered).toContain('\\u003c/script>');
  });
});
