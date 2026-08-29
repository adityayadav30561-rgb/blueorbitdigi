# Blue Orbit Digi — website

The mockups in `Blue Orbit Digi UI mockups.zip` (design-canvas files that needed a
React runtime) have been rebuilt as a plain static website. The pages sit at
the root of this repo so any host can serve them without configuration.

Plain HTML, CSS and JavaScript. No framework, no build step, no Node.js on the
server — it runs on any normal web hosting (cPanel, Hostinger, GoDaddy, Netlify,
GitHub Pages, or a plain Apache/nginx box).

## Run it locally

```bash
node serve.js
```

Then open <http://localhost:5173>.

You can also just double-click `index.html` — everything works from the file
system too, apart from the `.htaccess` rules.

## Files

```
index.html          Home
services.html       All nine services + full comparison tables
pricing.html        Every price on one page
seo.html            SEO service detail page
about.html          About / process / why clients stay
contact.html        Enquiry form + direct details
css/style.css       All styling (one commented file, 22 sections)
js/main.js          Header, menu, filters, tabs, form, motion
assets/logo.jpg     Brand logo
assets/icons/       Brand icons as local SVGs (no CDN needed)
images/             Photographs used on the site
robots.txt, sitemap.xml
.htaccess           Apache hosts only (clean URLs, gzip, caching)
vercel.json         Vercel only (clean URLs)
.vercelignore       Keeps internal files out of the deployment

Not part of the website:
serve.js            Local preview server
README.md           This file
brochure-content.md Pricing reference for print work
extracted/          The original design-canvas mockups
```

## Putting it online

**Shared hosting (cPanel, Hostinger, GoDaddy):** upload everything except the
"not part of the website" files above into `public_html`. `index.html` must sit
at the top level. Then point your domain at the host.

**Vercel / Netlify / GitHub Pages:** deploy the repo as-is. Because the pages
are at the root there is nothing to configure — no root directory, no build
command, no output directory.

Edit `sitemap.xml` and `robots.txt` if your domain is not `blueorbitdigi.co`.

Each host reads its own config file and ignores the others: `.htaccess` on
Apache, `vercel.json` on Vercel. Both just enable `/about` style URLs in place
of `/about.html`. Deleting either is harmless if you are not on that host.

## Photographs

Four photographs are in place, all from [Unsplash](https://unsplash.com) under
the Unsplash Licence — free for commercial use, no attribution required, no
watermark.

| File | Where | Size |
|---|---|---|
| `images/hero.jpg` | Home hero | 1100 × 1200 |
| `images/work.jpg` | Home, "why clients stay" | 1280 × 840 |
| `images/team.jpg` | About, "what we actually do" | 1280 × 880 |
| `images/office.jpg` | Contact side column | 800 × 440 |

These are stock photos of people who do not work here. That is normal practice,
but real photographs of your own team and your own client work would do more
for credibility than any stock image can. Swapping one is a straight
replacement: keep the filename, then update the `width` and `height` on the
matching `<img>` tag so the page does not shift while it loads.

Every slot uses `object-fit: cover`, so the image is cropped to the frame
rather than squashed — keep the subject near the centre.

## Making the contact form send mail

Right now the form validates the input and then opens the visitor's email app
with the enquiry pre-filled (`data-mode="mailto"` on the `<form>` tag). That
works everywhere but is not ideal.

To make it send properly on normal PHP hosting:

1. Create `send.php`:

   ```php
   <?php
   $name  = trim($_POST['name'] ?? '');
   $email = trim($_POST['email'] ?? '');
   $body  = "Name: $name\nEmail: $email\nPhone: " . ($_POST['phone'] ?? '') .
            "\nBusiness: " . ($_POST['business'] ?? '') .
            "\nNeeds: " . implode(', ', (array)($_POST['need'] ?? [])) .
            "\nBudget: " . ($_POST['budget'] ?? '') .
            "\n\n" . ($_POST['details'] ?? '');

   mail('info@blueorbitdigi.com', "Website enquiry - $name", $body,
        "From: website@blueorbitdigi.co\r\nReply-To: $email");

   header('Location: contact.html?sent=1');
   ```

2. In `contact.html`, change the form tag to:

   ```html
   <form id="enquiry-form" action="send.php" method="post" novalidate>
   ```

   (drop `data-mode="mailto"` — the JavaScript then only validates and lets the
   form submit normally).

Form services like Formspree or Web3Forms work the same way: set their URL as
the `action` and remove `data-mode="mailto"`.

## Fonts

- **Headings — Plus Jakarta Sans.** Enough character to read as a brand rather
  than a default, and it carries a 200 weight so the thin hero headline works.
- **Body and UI — Inter.** Designed for screens: big x-height, very legible at
  13–15px, which is most of this site.

Both have tabular (fixed-width) figures, switched on in section 15 of
`style.css` so the numbers in the price tables line up in straight columns.

To swap the pairing you change two things:

1. The `<link href="https://fonts.googleapis.com/css2?...">` tag in the `<head>`
   of all six pages (copy the URL from Google Fonts).
2. `--font-head` and `--font-body` at the top of `css/style.css` (section 2).

If you change to fonts of a different width, also check the `letter-spacing`
values — headings are tracked slightly tight and that is tuned per typeface.

## Icons

Two kinds, both local — nothing is fetched from a CDN at runtime:

- **Brand marks** (WordPress, Google, Visa, Facebook…) are SVG files in
  `assets/icons/`, from [Simple Icons](https://simpleicons.org). Each one
  has a dark version and a `-white` version for use on coloured backgrounds.
- **Interface icons** (check, arrow, mail, clock, target, wrench…) are inline
  `<svg>` written straight into the HTML, in the Lucide outline style. They are
  drawn with `currentColor`, so they take the colour and size of whatever they
  sit in — no icon font, no extra requests.

Useful classes:

| Class | What it does |
|---|---|
| `.ic` | Base inline icon. Sizes to `1em`, inherits colour. |
| `.feature-icon` | Blue rounded tile that heads a feature card. |
| `.feature-icon-soft` | Lighter version for use on dark panels. |
| `.step-icon` | Icon paired with a step number. |
| `.title-icon` | Icon sitting inline in a heading row. |

To swap an icon, replace the `<path>` data inside its `<svg class="ic">`.
Copy the paths from [lucide.dev](https://lucide.dev) — they use the same
24×24 grid and stroke style, so anything from there drops straight in.

The tick marks in the plan lists are drawn from CSS instead (section 15 of
`style.css`) so the list markup stays clean.

## Footer

The footer is a four-column panel: brand and social links, a Services column,
a Company column, and contact details. Below that sits a bottom bar with the
copyright, quick links and payment marks. It collapses to two columns on
tablets and one on phones.

**Before you launch, set the social links.** They are `href="#"` placeholders:

```html
<a href="#" aria-label="Blue Orbit Digi on Facebook">
```

There is a comment marking them in the HTML. LinkedIn is not included —
Simple Icons removed that logo after a trademark request, so there is no icon
for it in the set. If you want LinkedIn in the footer, drop your own
`linkedin.svg` into `assets/icons/` and copy one of the existing
`<a>` blocks.

The footer is repeated in all six pages (that is the trade-off for having no
build step), so a change to it has to be made in each file.

## Motion

All of it is in section 18 of `style.css` and sections 5–12 of `main.js`.

| Effect | What it does |
|---|---|
| Smooth scroll | Eases the real scroll position towards a target each frame, so the page glides instead of stepping. |
| Reveal on scroll | Blocks fade and rise in as they enter view; grid children stagger 95ms apart. |
| Hero headline | Splits into words that slide up from behind their own mask. |
| Counting stats | The hero and About figures count up when they scroll into view. |
| Progress bar | A 2px gradient line at the top showing how far down the page you are. |
| Parallax | The hero photo drifts slightly against the scroll. |
| Logo marquee | The technology row scrolls continuously and pauses on hover. |

**Everything is gated on a `js` class** set by a one-line inline script in each
`<head>`. That runs before the page paints, so nothing is ever visible and then
yanked away — and if JavaScript fails or is switched off, no content is hidden
in the first place.

**`prefers-reduced-motion` turns the whole thing off** — no hidden elements, no
lerped scroll, no marquee, no progress bar. The page just works.

### About the smooth scrolling

This is the one piece worth a second thought. It takes over the mouse wheel
(`preventDefault`) and eases the scroll position itself, which is how Lenis and
Locomotive Scroll — the libraries behind most "expensive-feeling" sites — do it.
It deliberately does **not** transform the page, so the sticky header, anchors
and the scrollbar all keep working normally.

Two deliberate limits: it is off on touch devices, which already have good
momentum of their own, and off for anyone who asks for reduced motion.

Some people dislike any scroll takeover on principle. To remove it, delete
section 6 of `main.js` — everything else keeps working, and the page falls back
to the browser's native scrolling.

To tune the feel, change these two values at the top of section 6:

```js
var EASE = 0.11;   // higher = snappier, lower = floatier
var STEP = 0.85;   // how far one wheel notch travels
```

Reveal timing lives in CSS: `--reveal-time` and `--ease-out` in section 18.
The stagger gap is the `95` in `show(kids[k], animate ? step * 95 : 0, instant)`.

## Mobile & tablet

Section 19 of `style.css`. The approach is to size by viewport rather than by
breakpoint, and to ask the device what it is rather than guess from its width.

**Fluid, not stepped.** Type, padding, gutters and corner radii use `clamp()`,
so they move continuously from 320px upwards instead of jumping at a
breakpoint. The hero headline runs from 30px to 68px without a single step.

**The device is asked, not guessed.**

- `pointer: coarse` — every control gets a 44px minimum target and a press
  state, because there is no hover to give feedback on a touchscreen.
- `hover: none` — effects that move things are switched off, so nothing gets
  stuck in a hovered state after a tap.
- `prefers-reduced-data` — decorative motion is dropped on metered connections.
- `env(safe-area-inset-*)` — content clears the notch and the rounded corners.
- Landscape phones get their own short-viewport rules.

**Comparison tables.** A five-column table cannot shrink onto a phone. Instead
of shrinking it, the feature column is pinned with `position: sticky` while the
plan columns are swiped sideways, so you can always see what the number in
front of you refers to. `overscroll-behavior-x: contain` stops that swipe from
triggering the browser's back gesture. The old 760px minimum width is gone, so
on a tablet the four-column tables now fit with no scrolling at all.

**Performance.** The blurred glass is the expensive part of this design.
Desktop runs about 33 blurred surfaces plus four animated full-screen blurred
gradients — fine for a desktop GPU, but mid-range phones drop frames on it.
Below 860px the blur comes off the cards, two background layers are dropped and
the rest stop animating, and the surfaces are made more opaque so the design
still reads the same. **That takes it from ~33 blurred layers to 2.**

Images are all `loading="lazy" decoding="async"` with explicit `width`/`height`
so nothing shifts as they load; the header logo is `fetchpriority="high"`.

**The phone number.** It is hidden from the header below 860px for space, which
would lose it entirely on the one device that can dial it — so it reappears as
the last row of the menu panel.

The menu closes on Escape (returning focus to the button), on an outside tap,
and on any link; while open it locks the page behind it so the background
cannot scroll away under your finger.

## Colour, contrast and surfaces

Sections 20 and 21 of `style.css`.

### Two accents, one job each

- **Blue** — anything you can act on: links, buttons, the header, section
  eyebrows, and the service-category badges.
- **Teal (`--teal`, #0f766e)** — affirmation: every tick, every "included"
  mark in the comparison tables, the feature icon tiles on About and SEO, and
  the result figures.

The rule is what keeps it restrained. Teal never appears decoratively — if it
is teal, it is saying *yes, you get this*.

### Contrast

All text now clears WCAG AA (4.5:1) on both surfaces:

| Token | Was | Now |
|---|---|---|
| `--ink-55` (most body copy) | 3.89:1 — **failed** | 4.87:1 |
| text links | 4.16:1 on the page gradient — **failed** | 4.98:1 |

Text links use `--blue-link` (#0a63c2), a shade darker than `--blue`. The
original blue stays on button and badge *fills*, where the contrast that
matters is the white text sitting on top of it, not the blue itself.

`--ink-40` is now .55 and is reserved for genuinely decorative marks — the
"not included" dashes, the dot separators. The three small captions that used
it (the country list, the payment lines) were moved to `--ink-55` so they pass.

### The quiet surface

Before this, a grid of frosted cards sat inside a frosted card — four times on
the services page alone. Glass on glass has no depth: nothing recedes and
nothing advances.

`.panel` is the answer: flat, opaque, slightly darker than the page, no blur
and no shadow. It reads as a tray. The frosted `.card` tiles placed on it are
pushed to 95% white so they clearly lift off it. Nine wrappers were converted,
and no card grid on the site now sits inside another card.

Use `.panel` for anything that *contains* cards, and `.card` for the cards
themselves. Keeping that split is what stops the glass becoming wallpaper.

## Tabs on the services page

Four stacked comparison tables was a wall of numbers, so the three monthly
retainers are now one table at a time.

It is a real tab widget: `role="tablist"`, roving `tabindex`, arrow keys
(with Home/End) to move between tabs, and `aria-selected` kept in sync.

Links from elsewhere on the site point at `services.html#seo` and
`services.html#social`, so the tab named in the URL is the one that opens —
including when the hash changes while you are already on the page.

The tab strip carries `hidden` in the HTML and JavaScript removes it, while
the panels are visible in the HTML and JavaScript hides them. With scripting
off, all three tables simply stack and stay readable.

## Changing content

Prices, plan features and copy are written directly in the HTML — search for the
number or sentence you want to change. Colours, spacing and fonts all come from
the variables at the top of `css/style.css` (section 2), so changing the brand
blue in one place updates buttons, links and highlights everywhere.

The original mockups are kept in `extracted/` for reference.
