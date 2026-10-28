# Studio 17 hero image specifications

Use three production crops. Export AVIF or WebP in sRGB and keep important faces, text-like artwork and logos inside the safe area.

| Hero asset | Recommended canvas | Display behavior | Safe area |
| --- | ---: | --- | --- |
| New homepage hero — desktop | 1920 × 560 px | Covers a hero approximately 500 px high | Keep essential artwork inside the central 1440 × 500 px |
| Standard page hero — desktop | 1920 × 420 px | Covers hero heights from 296 to 360 px | Keep essential artwork inside the central 1440 × 320 px |
| Mobile hero | 1080 × 1600 px | Covers portrait heroes approximately 560–620 px high | Keep essential artwork inside the central 900 × 1380 px |

## Export guidance

- Do not add a dark overlay to the image export; the homepage now displays the artwork without an automatic black layer.
- Avoid placing essential content in the outer 12.5% on either side of desktop images because the website uses soft edge fades.
- Mobile artwork should be composed independently rather than obtained by automatically cropping the desktop image.
- Recommended maximum file size: 250 KB for desktop and 180 KB for mobile where visual quality permits.
- The current `HomePage_heroimage.avif` is 1744 × 296 px. That ratio matched the older short hero but is too shallow for the new 500 px homepage hero, which is why the browser has to enlarge and crop it.
