# Karma of Fuquay — homepage update: developer handoff

**Status:** approved by the client, 2026-11-11.
**Preview (approved version):** https://sigovs.github.io/Karma-of-Fuquay/
**Source:** this repo. `index.html` is the approved homepage. `_original.html` is the untouched live homepage as of 2026-11-09, kept for diffing.

The approved page is a static copy of the live WordPress homepage (theme `aanWordpress`) with changes on top. Your job is to carry those changes into the WordPress theme and content. Everything new lives in **two new theme files** plus a set of **markup changes** and **new media**. The theme's own `style.css` is not edited.

---

## 1. New files to add

Put each file at the same path on the server; the CSS references them with relative paths. Media goes into the flat `wp-content/uploads/` structure this site already uses, not into `uploads/2026/11/`.

| Path | Size | What |
|---|---|---|
| `wp-content/themes/aanWordpress/assets/css/fuquay-updates.css` | 27 KB | All new styles |
| `wp-content/themes/aanWordpress/assets/js/fuquay-updates.js` | 11 KB | Hero rotation, film, line reveals, models scroll animation, map |
| `wp-content/uploads/EximiusHeroLandscape.mp4` + `-poster.jpg` | 5.8 MB / 66 KB | Hero film, desktop (no audio track, faststart) |
| `wp-content/uploads/EximiusHeroPortrait.mp4` + `-poster.jpg` | 5.8 MB / 48 KB | Hero film, ≤767px |
| `wp-content/uploads/hero/karma-{revero,invictus,kaveya,gyesera,ivara,amaris}-hero.jpg` | 215–439 KB each | Hero slide backgrounds |
| `wp-content/uploads/hero/karma-kaveya-hero-portrait.jpg` | 132 KB | Kaveya hero, ≤767px |
| `wp-content/uploads/models/karma-{revero,invictus,kaveya,gyesera,ivara,amaris}.jpg` | 38–103 KB each | Current Models, one image per model |
| `wp-content/uploads/2026cargurus.png` | 81 KB | Already on the server (used in the header); now also in the Karma GT section |

All photography and both films are from karmaautomotive.com. Each model's images come from that model's own page.

## 2. Loading order

The order is load-bearing:

**`<head>`**, after the theme's hard-coded `style.css` link in `header.php` (in `index.html` line 158–159):
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<link rel="stylesheet" href="…/assets/css/fuquay-updates.css" />
```
`fuquay-updates.css` must come after `style.css`, or several overrides lose.

**End of `<body>`**, after jQuery, owl.carousel and the inline owl init script (in `index.html` line 1477–1480):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script src="…/assets/js/fuquay-updates.js"></script>
```
`fuquay-updates.js` has to run after the owl init: its ready handler reads the carousel state that init creates.

If you use `wp_enqueue_*` instead, keep the same order: give the CSS a dependency on the theme stylesheet, and put the JS in the footer after the owl init.

**Scope.** The hero, models and Beauty styles only apply on the homepage. The **footer and the map are global** (`footer.php`), so loading the CSS only on the front page would leave the new footer on the homepage alone. Agree with the project lead whether the footer goes site-wide (recommended: it is the same footer).

## 3. Markup and content changes, section by section

Line numbers refer to `index.html`.

### 3.1 Owl init (inline script, line ~1420)
```js
autoplay: false,          // rotation is driven by fuquay-updates.js (exact progress line, pause, film hold)
animateOut: "heroOut",    // was "fadeOut"
animateIn: "heroIn",      // new: right-to-left clip-path shutter
```
The dealer's own `#carousel-custom-dots .owl-dot` click handler can stay; the new rail buttons stop propagation and drive the carousel themselves. Owl delegates clicks on any `<button>` inside the dots container, which is why this matters.

### 3.2 Hero slides (lines 617–740)
- **Every slide**: remove the inline `style="background-image: url(…) !important;"` and add classes instead. Backgrounds and per-breakpoint focal points are in the CSS, section 9:
  `item hero-slide hero-slide--{revero|invictus|kaveya|gyesera|ivara|amaris}`.
  If slides come from the CMS, derive the modifier class from the slide/model slug.
- **First slide (Eximius 1)** gets class `hero-slide--video` and this element as its first child (line 617–621):
  ```html
  <video class="hero-video" muted playsinline preload="none" aria-hidden="true" tabindex="-1">
    <source src="…/EximiusHeroPortrait.mp4" type="video/mp4" media="(max-width: 767px)" />
    <source src="…/EximiusHeroLandscape.mp4" type="video/mp4" />
  </video>
  ```
  No `autoplay` attribute: the script plays only the visible slide's film, holds the slide for the film's full length (8.5 s), then rotates on. The first frame sits under it as a CSS background, so the handover is seamless.
- **Revero slide content (CMS):** delete the extra framed image inside the slide copy (`Screenshot-2024-03-05-at-16.02.51_1.jpg`). The slide is bg + h1 + tagline + button + incentive line, like every other slide. Do not reintroduce the image-in-image.
- Empty `<p>&nbsp;</p>` spacers in slide copy are stripped by the script; removing them in the CMS is cleaner.

### 3.3 Hero model navigation (lines 751–~800)
Replace the old `.slider-nav` block with the `nav.slider-nav.hero-rail` block as it is in `index.html`: a `ul#carousel-custom-dots`, where each `li.owl-dot` contains a `button.hero-rail__btn` (track line + name), followed by the pause button `button.hero-rail__pause` with two inline SVG icons. Keep exactly one `li` per slide, in slide order. If the list is generated by a PHP loop, change the loop's markup.

### 3.4 Current Models (line 1105 → end of section)
Replace the whole tabbed `div.current-section` (old `<!-- ** Current Range Section -->`) with `section.models-section`: one `article.model-row.model-row--{slug}` per model, containing:
- `.model-row__media` with one `<img>` (width/height attributes set, `loading="lazy"`);
- `.model-row__text` with `h3.model-row__name`, `h4.model-row__tagline`, `p.model-row__copy` and the button.

The copy is the dealer's existing copy, unchanged. Each model now needs **one** image (was two) — if models are a CPT, add or repoint that image field to the new files in `uploads/models/`.

### 3.5 Karma GT / Beauty Through Balance (line 806–)
- Award image: `cargurus2026.png` (navy banner) → `2026cargurus.png` (transparent laurel), with `width="1976" height="1000"`.
- The faded car background is removed by CSS (`background-image: none`); nothing to delete in markup.
- The inline `<style>` block for `.beauty-content-cta` (line ~576) can stay; the new CSS overrides it.

### 3.6 Service Department
CSS only. A shade over the photo, and the copy lifted above the car image.

### 3.7 Footer (global, `footer.php`)
- **Map** (line 1358): add `<div id="fq-map" class="fq-map" role="region" aria-label="Map: Karma of Fuquay, 2900 N Main St, Fuquay-Varina, NC 27526"></div>` as the first child of `.footer-map-section`. The script turns it into a live map. The existing static map + pin link stay as the no-JS fallback.
- **Car block:** unchanged markup; the stripe behind the car is now CSS-only.
- **Bottom:** the old centred copyright column is replaced by the `div.fq-footer` block (line 1384–): logo + Privacy Policy | Sitemap, hairline, copyright + Powered By. The text is identical to the old footer. Point the logo link to `/`.

### 3.8 Alt text (inventory cards, template)
- Inventory card photos: `alt` = the vehicle title (e.g. `Used 2016 Ferrari F12 Berlinetta Coupe`). Set this in the card template, not by hand.
- Decorative icons (phone, location, account, star, text-to-phone, My Garage): `alt=""`.

## 4. Do NOT port — preview-only shims

These exist only so the static preview works on GitHub Pages:

| In the preview | On WordPress |
|---|---|
| `jQuery.ajaxPrefilter(…)` block right after jQuery (line ~117–124) | **Remove.** It points inventory requests at a static snapshot. |
| `isapi_xml.php` in the repo root | **Do not deploy.** The live site has the real endpoint. |
| `href="./"` on the three home links | Use `/` (or `home_url('/')`). |
| Relative asset paths in `index.html` (`wp-content/…`) | Use `get_template_directory_uri()` / absolute `/wp-content/…`. |
| `fuquay-updates.js` pin icon `wp-content/themes/…/footer-location.svg` (relative) | Make it absolute (`/wp-content/themes/aanWordpress/assets/images/footer-location.svg`), or the pin breaks on inner pages. |
| `_original.html`, `.nojekyll`, mirrored theme/plugin files | Reference only. `_original.html` is for diffing markup; the old images it pointed to (slide PNGs, two-image model pairs, the navy CarGurus banner) were removed from the repo once replaced, so it renders with gaps. They are still in git history (`git log --diff-filter=D --name-only`). |

## 5. Behaviour to keep (please verify after porting)

- **Reduced motion** (`prefers-reduced-motion: reduce`): nothing animates, the slider does not auto-advance, the film does not load (the slide shows its first frame), all text is visible. Hidden start states are applied by script only, so content stays visible if JS fails.
- **Hero rotation:** photo slides 5 s, the Eximius slide = film length; the progress line fills for exactly that time. Pause works; the rotation stops while the tab is in the background.
- **Keyboard:** rail buttons and pause are reachable by Tab and work with Enter/Space; the focus ring sits on the word only.
- **Pagination:** a right-aligned side column from 768 px up, a bottom rail below 768 px (scrolls sideways; the active model is kept clear of the edge fade).
- **Contrast** (WCAG AA 4.5:1). Measured on the rendered page: Service list worst 14:1 desktop / 7.1:1 mobile; hero rail labels ≥6:1 on every slide. Computed from the solid colours: footer text ≥7.4:1; Karma GT copy 15.5:1 (#242424 on white).
- **Map:** no scroll-wheel zoom (the page keeps the wheel); no one-finger drag on touch; the pin opens Google Maps directions.

**QA widths:** 1920, 1808×1081 (the reviewer's screen — some old `vh`-based theme rules only break on taller windows), 1440, 1024, 768, 390. No horizontal overflow, clean console.

**Lighthouse** (lab run on the preview vs the original): SEO 83 → 92; accessibility 72 → 87 mobile, 60 → 92 desktop; desktop LCP 4.0 s → 2.5 s; mobile page weight ~23 MB → ~12 MB. Mobile performance score did not improve (56 → 51, most likely the added GSAP/Leaflet); worth a look after porting.

## 6. Third-party

- **GSAP 3.12.5 + ScrollTrigger** (cdnjs) — free under GreenSock's standard license.
- **Leaflet 1.9.4** (cdnjs) — BSD-2.
- **Map tiles:** OpenStreetMap's public tile server, filtered to monochrome in CSS. Its usage policy is meant for light use. For production, consider a keyed provider (MapTiler, Stadia). That is one line in `fuquay-updates.js` (`L.tileLayer(...)` URL + attribution).

## 7. Open items

- The "Discover more" button in the Karma GT section links to `javascript:void(0)` on the live site too. It needs a real target (About Us?) — confirm with the project lead.
- The inventory cards' "Text to phone" links are `javascript:void(0)` (CMS). This is the last failing Lighthouse SEO check ("links are not crawlable"); a `<button>` would fix it.

Questions about the design: the project lead (Alex).
