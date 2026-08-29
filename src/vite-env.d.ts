/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 'canonical' when `public/CNAME` exists at build time, otherwise 'preview'.
   * Set via `define` in vite.config.ts; `preview` renders `<meta name="robots"
   * content="noindex">` (decision D5).
   */
  readonly VITE_SITE_MODE: 'canonical' | 'preview';
  /**
   * Dev/QA override for `site.inquiry.endpoint` (plan Appendix H). Points the
   * inquiry adapter at `scripts/mock-inquiry-server.mjs` so every form state can
   * be exercised without a deployed backend:
   *
   *   VITE_INQUIRY_ENDPOINT=http://localhost:8787 npm run dev
   *
   * Unset in production builds, where `src/config/site.ts` is the only source.
   */
  readonly VITE_INQUIRY_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
