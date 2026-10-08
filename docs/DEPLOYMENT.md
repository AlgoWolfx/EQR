# Deployment and SEO

Cloudflare Pages: build command `npm run build`, output directory `dist`, Node 24.
This is a static app; it needs no runtime server or secrets. Deploying this repository does not configure an existing EGORA website. The final public address is not set.

The final URL is deliberately configurable. Copy `.env.example` to `.env.local`
and set `PUBLIC_SITE_URL` to the **exact page URL**, including any subdirectory:

```dotenv
PUBLIC_SITE_URL=https://your-real-domain.com/tools/qr-code-generator/
```

Use your actual URL before publishing. The build derives Vite asset paths,
manifest scope, service-worker scope, canonical, Open Graph URLs, image URLs,
robots and sitemap from this one value. The configured example domain is not
part of the default build.

- Without a URL, local/preview HTML uses `noindex, nofollow`, robots blocks crawling,
  and no canonical or sitemap is guessed.
- With a URL, the build emits `index, follow`, a canonical, `robots.txt` and
  `sitemap.xml` with the generator URL. `og-card.png` is a real 1200×630 share image.
- Guide, use cases, static/dynamic explanation and FAQ are present in the initial
  HTML; only the local generator requires JavaScript. FAQ JSON-LD uses the same
  answers as the visible page. WebApplication includes a free offer without fake
  reviews. FAQ structured data does not guarantee a Google rich result.
- A real `404.html` avoids indexing unknown paths through an SPA catch-all.
  Cloudflare `_headers` sets immutable hashed-asset caching and basic headers.

For root hosting, publish `dist/` directly. For a subdirectory, mount its contents
at the configured path in your existing site/proxy; setting `PUBLIC_SITE_URL`
does not automatically configure Cloudflare or move files. Merge the sitemap
reference into the **host's root robots.txt**, since crawlers consult that file.
Leave `/assets/` and service-worker paths relative to the configured tool path.

The only published page is `/` relative to the configured mount path. Use-case
links like `?type=wifi#studio` open a real generator mode and share the main
canonical. They do not create duplicate SEO landing pages. `futurePages` in
`src/site/config.ts` records Wi-Fi, WhatsApp, URL, vCard and email page contracts;
publish those only after adding unique content and mode-specific answers. Enable
`site.moreTools` links only when their destinations exist.

Check final-domain HTTPS, canonical URLs, sitemap, crawler access, Search Console,
mobile hardware and Lighthouse after integrating with the main website.
