/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 'canonical' when `public/CNAME` exists at build time, otherwise 'preview'.
   * Set via `define` in vite.config.ts; `preview` renders `<meta name="robots"
   * content="noindex">` (decision D5).
   */
  readonly VITE_SITE_MODE: 'canonical' | 'preview';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
