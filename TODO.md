# TODO

## Preserve scroll position on language switch

When the user switches language the page reloads (full navigation via
`window.location.href`) and the browser scrolls back to the top instead
of staying at the same scroll position.

Expected: scroll position is maintained after language change.
