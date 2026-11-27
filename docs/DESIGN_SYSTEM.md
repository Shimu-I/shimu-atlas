# Design System — "Cherry Blossom"

Tokens live in `frontend/src/styles/tokens.css`. `npm run check:contrast` verifies every pairing below against WCAG AA in both themes.

## Palette (from the supplied card)

| Name | Hex | Role |
|------|-----|------|
| Raisin Black | `#2B181E` | Dark theme page background; light theme body text |
| Silver Pink | `#C8A8B6` | Dark theme secondary text |
| Desert Sand | `#ECC3A5` | Light theme sidebar |
| New York Pink | `#D88084` | Dark theme primary buttons and accents |
| Deep Puce | `#A65665` | Light theme primary buttons and accents |

Derived values (tints and shades made for readability, not on the card): page and surface tints, borders, the darker link colour in light mode (`#843A4A`), muted text in light mode, and error colours.

## Which text colour goes on which colour

Taken from the card's own heading colours:

| Background | Heading / accent text | Body text |
|------------|----------------------|-----------|
| Raisin Black (dark page) | Pink `#E39EB1` | Off-white `#E5DADE`; secondary Silver Pink |
| Desert Sand (light sidebar) | Navy `#1C3247` | Raisin Black |
| Light page tint | Navy `#1C3247` | Raisin Black; secondary `#6A4A57` |
| New York Pink (dark buttons) | — | Raisin Black label |
| Deep Puce (light buttons) | — | Pale peach `#FFF3E8` label |
| Silver Pink (reserved) | Plum `#41303A` | — |

The card's peach `#FFD4A7` on Deep Puce reaches only about 3.9:1, which is fine for large headings but not for button labels, so buttons use the paler peach above (4.65:1).

## Typography

- **Headings:** DM Serif Display (closest free match to the card's display serif).
- **Interface:** DM Sans.
- **Book reading surfaces:** Source Serif 4, kept for comfort over long passages.

## Rules

- Light theme is the default and follows the system preference; users can switch.
- Colour is never the only signal; icons and text accompany status colours.
- Reading surface text meets 7:1 contrast.
