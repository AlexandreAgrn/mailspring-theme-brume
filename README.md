# Brume for Mailspring

Two light, minimal, pastel themes for [Mailspring](https://getmailspring.com), designed around Apple's Liquid Glass language (macOS 26).

- **Brume**: soft lavender chrome, periwinkle accent.
- **Brume Ardoise**: the same theme with a slate sidebar and a coral accent, a nod to the built-in Darkside theme.

Both themes share the exact same rules. Brume Ardoise only redefines color tokens, so layout, spacing, radii and behavior are identical in both.

![Brume](screenshots/brume.png)
![Brume Ardoise](screenshots/brume-ardoise.png)

![Message details](screenshots/message-details.png)

![Composer](screenshots/composer.png)

## Install

1. Download the latest release, or clone this repository.
2. In Mailspring: **Mailspring > Install Theme...**, then select the `brume` or `brume-ardoise` folder.
3. **Mailspring > Change Theme...**, then pick the theme. In automatic (light/dark) mode, set it as the light theme in **Preferences > Appearance**.
4. **Quit Mailspring completely (Cmd+Q) and relaunch it.** Mailspring keeps a preloaded composer window that only sees themes installed before it opened, and reads sidebar widths and row heights at startup.

Both themes can be installed side by side.

## What's inside

- **Glass only where it belongs**: popovers, menus, search suggestions and dropdowns are frosted glass; content (message list, messages) stays opaque.
- **Concentric radii** on a single scale (6, 8, 10, 14, 20pt and capsules).
- **Continuous toolbar**: each toolbar segment takes the color of its column, no hard separators.
- **Sidebar**: resizable from 200 to 420pt (instead of 165 to 250pt), 32pt rows, right-aligned counters, traffic lights centered on the toolbar axis.
- **Message list**: rounded selection pills, subtle inset separators, visible checkboxes aligned with the unread dot, a gray star on hover to follow a thread.
- **Click to deselect**: clicking the empty area of the list closes the open message and clears the selection; clicking anywhere else removes the keyboard cursor frame.
- **Sync button**: a "Sync New Mail Now" capsule at the top right of the window, same as F5.
- **Sender address in Spam**: in the Spam (Junk) folder only, the sender's address appears under their name, local part muted and domain in full weight, so you can sort junk at a glance. When an address is too long, the start fades out and the end of the domain stays visible; the full address is in the tooltip.
- **Code**: click to deselect, the sync button and the Spam addresses are the only parts that need code (a small `lib/main.js`, loaded with the theme and removed when you switch themes).
- **Reading pane**: messages as cards, the reply area attached to the last card. Sender, date, reply and Unsubscribe on a single line; a chevron opens a clean details sheet (recipients, subject, folders).
- **Composer**: a floating formatting bubble that stays in view while scrolling, without jumping, and a floating capsule action bar with centered, round icon buttons. Quoted text in a calm gray with a soft accent bar; the From, signature and Send menus open cleanly above everything.
- **Thin-line icons**: about seventy of Mailspring's icons are redrawn in one consistent thin-stroke style (every sidebar icon, reply, forward, spam, read state, print, attachments, formatting bar, search, empty folders and more), sized and centered on a single grid.
- **Search field**: a glass lens (lit rim, soft shadow) aligned with the list's selection pills; it lights up in the accent color when focused.
- **Attachments**: one card per file with a hairline border, the thumbnail clipped to the card, and round preview / download / remove buttons.
- **Message features**: read receipts as a capsule ("2 opens") with a clean "Opened by" list, calendar invitation cards with tinted reply capsules, and palette-matched phishing, reminder and translation banners. Find in thread (Cmd+F) becomes a capsule search field.
- **Sync activity**: "Checking for mail" becomes a card with a thin spinner at the bottom of the sidebar.
- **Restyled components**: recipient tokens, undo toast, snooze popover, switches, notifications, swipe colors, mini calendar, dropdown menus, native select boxes, grammar suggestions, time picker, avatars and the Gmail "important" marker.
- **Preferences**: account, signature, template and rule lists as single cards with pastel selection, detached detail panels, and the theme picker, subscription and Pro-feature windows in the theme's colors.
- **Accessibility**: respects Reduce transparency, Reduce motion and Increase contrast. Text colors meet WCAG AA.

## Customize

Everything is driven by tokens in `styles/ui-variables.less`:

- accent: `@brume-accent`;
- sidebar width bounds: `@brume-sidebar-min-width`, `@brume-sidebar-max-width`;
- list row heights: `@brume-thread-row-wide`, `@brume-thread-row-narrow`;
- follow the macOS accent color: see the comment in `styles/index.less`.

To make your own color variant, copy `brume-ardoise`, rename it in `package.json` (`name` and `displayName`), and change the color tokens at the end of `styles/ui-variables.less`.

## Known limitations

- Mailspring's window is opaque, so the desktop does not show through the sidebar as in native apps.
- Designed for macOS. It works on Windows and Linux, but the toolbar capsules are macOS-specific.
- Spam addresses show in the wide list layout only (list mode, or a message list wider than 540pt). Mailspring's narrow layout has no room for them.
- Email bodies keep their own formatting: Mailspring renders them in an isolated frame that themes cannot reach.
- The account setup window always uses Mailspring's default look: Mailspring disables themes there on purpose.

## Credits

Brume Ardoise's slate and coral palette is inspired by Darkside by Jamie Wilson, one of Mailspring's built-in themes (MIT). Built on the [Mailspring Theme Starter](https://github.com/Foundry376/Mailspring-Theme-Starter).

## License

MIT
