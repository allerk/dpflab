# Map App Selector Design

## Goal

Make the workshop address in the public contact card actionable without choosing a map provider for the visitor. Clicking the address must always present an explicit provider menu.

## Scope

- Keep `contacts.address` as the existing required string; no schema or admin-form changes.
- Replace the plain address text in `ContactForm.svelte` with an accessible menu trigger.
- Offer actions in this exact order:
  1. Google Maps
  2. Waze
  3. Apple Maps
  4. Copy address
- Add Russian, Estonian, and English labels and feedback text.

Coordinates, map embeds, provider detection, and additional map services are outside this change.

## User Experience

The map icon and address form one button styled consistently with the other contact links. Activating it opens a compact menu anchored to the address.

Each provider action opens a route to the workshop in a new browsing context. Installed mobile apps may claim their supported HTTPS links; otherwise the provider's web experience opens. The site supplies only the destination and does not choose a transport mode.

The copy action writes the unchanged address string to the clipboard, closes the menu, and shows a short localized confirmation. If clipboard access fails, the menu remains usable and shows a localized failure message.

The menu closes after selecting an action, clicking outside it, or pressing Escape.

## Link Construction

All provider links are derived at render time from the current `contactsRow.address` value using standard URL query encoding:

- Google Maps: `https://www.google.com/maps/dir/?api=1&destination=<address>`
- Waze: `https://waze.com/ul?q=<address>&navigate=yes`
- Apple Maps: `https://maps.apple.com/?daddr=<address>`

The implementation uses HTTPS universal links rather than app-only URL schemes so a missing application has a web fallback. No API key is required.

## Component Design

Create a focused public `MapAppSelector.svelte` component. Its public interface accepts the address string. The component owns:

- open/closed state;
- generated provider URLs;
- click-outside and Escape handling;
- clipboard state and transient success/error feedback;
- accessible trigger and menu semantics.

`ContactForm.svelte` remains responsible only for placing the component in the contact list next to the existing map icon.

## Accessibility

- Use a real button for the address trigger.
- Expose menu state with `aria-expanded` and the relationship with the menu through `aria-controls`.
- Give the trigger an explicit localized accessible label.
- Keep every menu item keyboard reachable with visible focus styling.
- Return focus to the trigger when Escape closes the menu.
- Announce clipboard success or failure through a polite live region.
- Keep touch targets large enough for mobile interaction.

## Internationalization

Add message keys for:

- opening the map selector;
- Google Maps, Waze, and Apple Maps action labels;
- copying the address;
- copy success;
- copy failure.

Provide complete values in `messages/ru.json`, `messages/et.json`, and `messages/en.json`.

## Testing

Add focused tests for:

- correctly encoded Google Maps, Waze, and Apple Maps URLs;
- the required provider/action order;
- opening and closing the menu;
- Escape and click-outside behavior;
- clipboard success and failure feedback;
- localized message coverage through the normal project checks.

Run `npm run check`, `npm test`, and `npm run build` before completion.

