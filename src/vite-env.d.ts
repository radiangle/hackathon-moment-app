/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SKYFLOW_VAULT_ID: string
  readonly VITE_SKYFLOW_VAULT_URL: string
  readonly VITE_SKYFLOW_TABLE_NAME: string
  readonly VITE_SKYFLOW_ACCOUNT_ID: string
  readonly VITE_SKYFLOW_BEARER_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

