# SharkWire.dev

The landing page for **SharkWire** — the public maker and technical-service
label for projects connected to the web, by Snaxine Reefica.

This repository holds a single static page. There is no framework, no
client-side JavaScript, and no build dependencies.

## Structure

```
index.html      page markup
styles.css      all styles (palette, type, layout, ambient decoration)
favicon.svg     Cable Shark mark, used as both favicon and inline header logo
robots.txt      crawler policy
_headers        Cloudflare Pages response headers (security headers, caching)
scripts/        the two Node scripts below
```

## Local validation

```sh
npm run check
```

Runs `scripts/check.mjs`, a dependency-free Node script that does structural
validation against the HTML, CSS, and SVG using only Node built-ins (no
`npm install` required): required files exist, tags balance, the approved
hero copy is present verbatim, the palette is intact, focus/reduced-motion
styles exist, and a few brand guardrails (e.g. no "coming soon" filler, no
mascot language) hold.

## Build

```sh
npm run build
```

Runs `scripts/build.mjs`, which copies the site files
(`index.html`, `styles.css`, `favicon.svg`, `robots.txt`, `_headers`) into a
fresh `dist/` directory. `dist/` is the deploy artifact and is git-ignored.

## Deploying on Cloudflare Pages

Create the Pages project from the **dashboard by connecting this GitHub
repository** (Workers & Pages → Create → Pages → Connect to Git) rather than
using the direct-upload flow, so future pushes to `main` redeploy
automatically.

Project settings:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/`

No environment variables or framework preset are needed — select "None" for
the framework preset.

### Custom domain

Once the project deploys successfully from the default `*.pages.dev` URL, add
`sharkwire.dev` under the Pages project's **Custom domains** tab. If the
domain's DNS is already on Cloudflare, Pages can attach the CNAME
automatically; otherwise point the domain's DNS at the target Cloudflare
gives you, then wait for certificate issuance.

## License

MIT, see [LICENSE](LICENSE).

Built by Snaxine Reefica.
