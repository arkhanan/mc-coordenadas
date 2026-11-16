/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_MC_SERVER_IP: string;
  readonly VITE_MC_SERVER_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
