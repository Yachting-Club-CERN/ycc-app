/// <reference types="react-scripts" />

interface Window {
  oauth2Token?: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_ENVIRONMENT?: string;
    REACT_APP_KEYCLOAK_SERVER_URL?: string;
    REACT_APP_KEYCLOAK_REALM?: string;
    REACT_APP_KEYCLOAK_CLIENT?: string;
    REACT_APP_YCC_HULL_URL?: string;
  }
}
