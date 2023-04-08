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

// Use this if you run everything locally
//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOCAL_CONFIG: Config = {
  environment: Environment.DEVELOPMENT,
  keycloakServerUrl: 'https://ycc-auth.web.cern.ch/',
  keycloakRealm: 'YCC-DEV',
  keycloakClient: 'ycc-app-dev',
  yccHullUrl: 'http://localhost:8000',
};

// Use this configuration if you run the backend locally, but you use KeyCloak YCC-DEV from CERN OKD
//
// Note: if you run YCC Hull locally, make sure that it connects to the same database at CERN as Keycloak realm YCC-DEV
//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEV_WITH_LOCAL_HULL_CONFIG: Config = {
  environment: Environment.DEVELOPMENT,
  keycloakServerUrl: 'https://ycc-auth.web.cern.ch/',
  keycloakRealm: 'YCC-DEV',
  keycloakClient: 'ycc-app-dev',
  yccHullUrl: 'http://localhost:8000',
};

const DEFAULT_CONFIG = LOCAL_CONFIG;

const config: Config = {
  environment:
    Environment[
      process.env.REACT_APP_ENVIRONMENT as keyof typeof Environment
    ] || DEFAULT_CONFIG.environment,
  keycloakServerUrl:
    process.env.REACT_APP_KEYCLOAK_SERVER_URL ||
    DEFAULT_CONFIG.keycloakServerUrl,
  keycloakRealm:
    process.env.REACT_APP_KEYCLOAK_REALM || DEFAULT_CONFIG.keycloakRealm,
  keycloakClient:
    process.env.REACT_APP_KEYCLOAK_CLIENT || DEFAULT_CONFIG.keycloakClient,
  yccHullUrl: process.env.REACT_APP_YCC_HULL_URL || DEFAULT_CONFIG.yccHullUrl,
};

export {Environment};
export default config;
