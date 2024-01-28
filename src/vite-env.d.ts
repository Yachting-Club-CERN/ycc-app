/// <reference types="vite/client" />

interface Window {
  oauth2Token?: string;
}

interface ImportMetaEnv {
  readonly VITE_APP_ENVIRONMENT?: string;
  readonly VITE_APP_KEYCLOAK_SERVER_URL?: string;
  readonly VITE_APP_KEYCLOAK_REALM?: string;
  readonly VITE_APP_KEYCLOAK_CLIENT?: string;
  readonly VITE_APP_YCC_HULL_URL?: string;
}


interface ImportMeta {
  readonly env: ImportMetaEnv
}
