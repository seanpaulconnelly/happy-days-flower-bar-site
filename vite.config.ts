import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `public/CNAME` is the single switch for both the base path and indexability.
// Until it exists the site is served from the GitHub project-pages URL, so the
// CI workflow sets BASE_PATH=/happy-days-flower-bar-site/ and the build is
// marked 'preview' (noindex). Once CNAME lands, base is '/' and mode is
// 'canonical'. See plan §3.3 and decisions D5.
const hasCname = existsSync(fileURLToPath(new URL('./public/CNAME', import.meta.url)));
const siteMode = hasCname ? 'canonical' : 'preview';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_SITE_MODE': JSON.stringify(siteMode),
  },
  build: {
    target: 'baseline-widely-available',
  },
  preview: {
    port: 4173,
  },
});
