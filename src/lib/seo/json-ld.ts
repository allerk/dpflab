/**
 * Render a JSON-LD script tag whose payload cannot terminate the script
 * element, even when a value comes from an editable site setting.
 */
export function renderJsonLdScript(value: unknown): string {
  const json = JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `<script type="application/ld+json">${json}</script>`;
}
