enum Environment {
  PRODUCTION = 'PRODUCTION',
  TEST = 'TEST',
  DEVELOPMENT = 'DEVELOPMENT',
  LOCAL = 'LOCAL',
}

type Config = {
  environment: Environment;
  keycloakServerUrl: string;
  keycloakRealm: string;
  keycloakClient: string;
  yccHullUrl: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOCAL_CONFIG: Config = {
  environment: Environment.LOCAL,
  keycloakServerUrl: 'http://localhost:8080',
  keycloakRealm: 'YCC-LOCAL',
  keycloakClient: 'ycc-app-local',
  yccHullUrl: 'http://localhost:8000',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEV_WITH_LOCAL_HULL_CONFIG: Config = {
  environment: Environment.DEVELOPMENT,
  keycloakServerUrl: 'https://ycc-auth.web.cern.ch',
  keycloakRealm: 'YCC-DEV',
  keycloakClient: 'ycc-app-dev-local',
  yccHullUrl: 'http://localhost:8000',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEV_CONFIG: Config = {
  environment: Environment.DEVELOPMENT,
  keycloakServerUrl: 'https://ycc-auth.web.cern.ch',
  keycloakRealm: 'YCC-DEV',
  keycloakClient: 'ycc-app-dev-local',
  yccHullUrl: 'https://ycc-hull-dev.web.cern.ch',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_CONFIG: Config = {
  environment: Environment.TEST,
  keycloakServerUrl: 'https://ycc-auth.web.cern.ch',
  keycloakRealm: 'YCC-TEST',
  keycloakClient: 'ycc-app-test-local',
  yccHullUrl: 'https://ycc-hull-test.web.cern.ch',
};

// Use this configuration if you run everything locally
const DEFAULT_CONFIG = LOCAL_CONFIG;

// Use this configuration if you run the backend locally, but you use KeyCloak YCC-DEV from CERN OKD
//
// Note: if you run YCC Hull locally, make sure that it connects to the same database at CERN as Keycloak realm YCC-DEV
// const DEFAULT_CONFIG = DEV_WITH_LOCAL_HULL_CONFIG;

// Use this configuration if you only run the frontend locally and you use KeyCloak YCC-DEV and YCC Hull from CERN OKD
// const DEFAULT_CONFIG = DEV_CONFIG;

const config: Config = {
  environment:
    Environment[
      import.meta.env.VITE_APP_ENVIRONMENT as keyof typeof Environment
    ] || DEFAULT_CONFIG.environment,
  keycloakServerUrl:
    import.meta.env.VITE_APP_KEYCLOAK_SERVER_URL ||
    DEFAULT_CONFIG.keycloakServerUrl,
  keycloakRealm:
    import.meta.env.VITE_APP_KEYCLOAK_REALM || DEFAULT_CONFIG.keycloakRealm,
  keycloakClient:
    import.meta.env.VITE_APP_KEYCLOAK_CLIENT || DEFAULT_CONFIG.keycloakClient,
  yccHullUrl: import.meta.env.VITE_APP_YCC_HULL_URL || DEFAULT_CONFIG.yccHullUrl,
};

export {Environment};
export default config;
