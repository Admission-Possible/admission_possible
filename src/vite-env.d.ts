/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where Join POSTs submissions. Defaults to the same-origin /api/join function. */
  readonly VITE_JOIN_ENDPOINT?: string;
  /** A mailbox the project verifiably controls, shown as a manual fallback. */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
