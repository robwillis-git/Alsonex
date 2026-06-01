// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Astro static-site config for Alsonex.
// Output: static files in ./dist for upload to cPanel public_html.
// `site` is used for canonical URLs / sitemaps — update to the production domain.
export default defineConfig({
  site: 'https://alsonex.com.au',
  output: 'static',
  integrations: [react()],
  // Trailing-slash 'ignore' keeps cPanel/Apache happy with both /about and /about/.
  trailingSlash: 'ignore',
});
