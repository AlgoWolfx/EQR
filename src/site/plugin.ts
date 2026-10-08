import type { Plugin } from 'vite';
import { resolveSite } from './config';
import { escapeHTML, renderHead, renderPage } from './render';

export function staticSite(publicURL: string): Plugin {
  const location = resolveSite(publicURL);
  return {
    name: 'eqr-static-site',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace('<!--site-head-->', renderHead(location))
          .replace('<!--site-page-->', renderPage(location));
      },
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: location.indexable
          ? `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', location.url).href}\n`
          : 'User-agent: *\nDisallow: /\n',
      });
      if (location.url)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHTML(location.url)}</loc></url></urlset>`,
        });
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: `<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | EQR</title><body><main><h1>Page not found</h1><p><a href="${escapeHTML(location.base)}">Open the QR code generator</a></p></main></body></html>`,
      });
      // QR data is never included in any generated page or search metadata.
      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: `${location.base}assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`,
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] === `${location.base}robots.txt`) {
          res.setHeader('Content-Type', 'text/plain');
          res.end('User-agent: *\nDisallow: /\n');
          return;
        }
        next();
      });
    },
  };
}
