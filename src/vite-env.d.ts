/// <reference types="vite/client" />

// eslint-disable-next-line no-var
declare var oauth2Token: string | undefined;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_APP_ENVIRONMENT?: string | undefined;
  readonly VITE_APP_KEYCLOAK_SERVER_URL?: string | undefined;
  readonly VITE_APP_KEYCLOAK_REALM?: string | undefined;
  readonly VITE_APP_KEYCLOAK_CLIENT?: string | undefined;
  readonly VITE_APP_YCC_HULL_URL?: string | undefined;
  /** For testing only: bypasses Keycloak authentication with a mock user. */
  readonly VITE_TEST_USER?: string | undefined;
}
