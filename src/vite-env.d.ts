/// <reference types="vite/client" />

interface Navigator {
  userAgentData?: NavigatorUserAgentData;
  mobile?: boolean;
}

interface NavigatorUserAgentData {
  platform?: string;
}

interface Window {
  oauth2Token?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_APP_ENVIRONMENT?: string;
  readonly VITE_APP_KEYCLOAK_SERVER_URL?: string;
  readonly VITE_APP_KEYCLOAK_REALM?: string;
  readonly VITE_APP_KEYCLOAK_CLIENT?: string;
  readonly VITE_APP_YCC_HULL_URL?: string;
}
