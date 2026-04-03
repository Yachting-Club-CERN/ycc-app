/// <reference types="vite/client" />

// eslint-disable-next-line no-var
declare var oauth2Token: string | undefined;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- interface for declaration merging
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- interface for declaration merging
interface ImportMetaEnv {
  readonly VITE_APP_ENVIRONMENT?: string | undefined;
  readonly VITE_APP_KEYCLOAK_SERVER_URL?: string | undefined;
  readonly VITE_APP_KEYCLOAK_REALM?: string | undefined;
  readonly VITE_APP_KEYCLOAK_CLIENT?: string | undefined;
  readonly VITE_APP_YCC_HULL_URL?: string | undefined;
}
