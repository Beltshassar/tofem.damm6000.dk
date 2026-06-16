# tofem.damm6000.dk

Anniversary invitation landing page for **Laila & Daniel's Sølvbryllup** (25 years — "to fem" = 2+5), 17. oktober 2026.

## Stack

Pure static HTML/CSS/JS. No build tools, no frameworks, no npm. Google Fonts only external dependency.

## Hosting

GitHub Pages — repo `Beltshassar/tofem.damm6000.dk`, branch `main`, root folder.
Live at: `https://beltshassar.github.io/tofem.damm6000.dk/`
Optional custom domain: `tofem.damm6000.dk` (add `CNAME` file + DNS record).

## Fonts

| Font | Usage | Reason |
|------|-------|--------|
| Abril Fatface | `h1`, `h2` | Bold, elegant serif with high contrast — reads well over dark bg |
| Lato 300/400 | Body, labels, date | Clean, minimal, pairs well with display serif |

## Colour palette

| Token | Hex | Role |
|-------|-----|------|
| `--bg` | `#0a0a0c` | Near-black background |
| `--red` | `#e8264a` | Offset red — anaglyph left channel, CTA left |
| `--cyan` | `#1adde8` | Offset cyan — anaglyph right channel, CTA right |
| `--white` | `#f0eff5` | Primary text |

Palette mirrors the anaglyph 3D-glasses aesthetic used on the physical invitation.

## Parallax effect

`script.js` listens to `mousemove` (desktop) and `deviceorientation` (mobile).
Target tilt angles are lerp-smoothed each `requestAnimationFrame` tick and applied
as `rotateX/rotateY` transforms scaled by each layer's `data-depth` attribute.

iOS 13+ requires a user-gesture to grant `DeviceOrientationEvent` permission — the
script requests it on the first click/tap.

## Placeholder URLs

Both CTA links in `index.html` use placeholder strings that must be replaced:

- `TODO_WISHLIST_URL` — wish-list page URL
- `TODO_FACEBOOK_URL` — Facebook event URL
