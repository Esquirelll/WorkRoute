import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Adds a Content-Security-Policy to the BUILT site only (the dev server needs inline scripts to work).
 * A CSP is a list of rules the browser enforces: "only run scripts, styles, fonts and requests that come
 * from this same site". It limits the damage if a bug ever let someone inject code into a page.
 * GitHub Pages cannot send real HTTP headers, so this uses a <meta> tag (which covers most, not all, rules).
 * 'unsafe-inline' for styles is needed by the small boot loader in index.html and by Framer Motion's inline styles.
 */
function securityMeta(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    name: 'workroute-security-meta',
    apply: 'build',
    transformIndexHtml(html) {
      const tags = `<meta http-equiv="Content-Security-Policy" content="${csp}" />\n    <meta name="referrer" content="no-referrer" />\n    `;
      return html.replace('<title>', `${tags}<title>`);
    },
  };
}

// base './' makes asset paths relative, so the built site works from any
// GitHub Pages sub-folder (e.g. username.github.io/workroute/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), securityMeta()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
