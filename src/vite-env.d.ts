/// <reference types="vite/client" />

interface Navigator {
  userAgentData?: NavigatorUserAgentData | undefined;
  mobile?: boolean | undefined;
}

interface NavigatorUserAgentData {
  platform?: string | undefined;
}

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
}
