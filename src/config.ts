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

const DEFAULT_LOCAL_CONFIG: Config = {
  environment: Environment.LOCAL,
  keycloakServerUrl: 'http://localhost:8080/',
  keycloakRealm: 'YCC-LOCAL',
  keycloakClient: 'ycc-app-local',
  yccHullUrl: 'http://localhost:8000',
};

const config: Config = {
  environment:
    Environment[
      process.env.REACT_APP_ENVIRONMENT as keyof typeof Environment
    ] ?? DEFAULT_LOCAL_CONFIG.environment,
  keycloakServerUrl:
    process.env.REACT_APP_KEYCLOAK_SERVER_URL ??
    DEFAULT_LOCAL_CONFIG.keycloakServerUrl,
  keycloakRealm:
    process.env.REACT_APP_KEYCLOAK_REALM ?? DEFAULT_LOCAL_CONFIG.keycloakRealm,
  keycloakClient:
    process.env.REACT_APP_KEYCLOAK_CLIENT ??
    DEFAULT_LOCAL_CONFIG.keycloakClient,
  yccHullUrl:
    process.env.REACT_APP_YCC_HULL_URL ?? DEFAULT_LOCAL_CONFIG.yccHullUrl,
};

export {Environment};
export default config;
