/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BATCH_SIZE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}