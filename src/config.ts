enum Environment {
  PRODUCTION = "PRODUCTION",
  TEST = "TEST",
  DEVELOPMENT = "DEVELOPMENT",
  LOCAL = "LOCAL",
}

type Config = {
  environment: Environment;
  keycloakServerUrl: string;
  keycloakRealm: string;
  keycloakClient: string;
  yccHullUrl: string;
};

const DefaultConfigs = {
  LOCAL: {
    environment: Environment.LOCAL,
    keycloakServerUrl: "http://localhost:8080",
    keycloakRealm: "YCC-LOCAL",
    keycloakClient: "ycc-app-local",
    yccHullUrl: "http://localhost:8000",
  },
  DEV_WITH_LOCAL_HULL: {
    environment: Environment.LOCAL,
    keycloakServerUrl: "https://ycc-auth.web.cern.ch",
    keycloakRealm: "YCC-DEV",
    keycloakClient: "ycc-app-dev-local",
    yccHullUrl: "http://localhost:8000",
  },
  DEV: {
    environment: Environment.DEVELOPMENT,
    keycloakServerUrl: "https://ycc-auth.web.cern.ch",
    keycloakRealm: "YCC-DEV",
    keycloakClient: "ycc-app-dev-local",
    yccHullUrl: "https://ycc-hull-dev.web.cern.ch",
  },
  TEST: {
    environment: Environment.TEST,
    keycloakServerUrl: "https://ycc-auth.web.cern.ch",
    keycloakRealm: "YCC-TEST",
    keycloakClient: "ycc-app-test-local",
    yccHullUrl: "https://ycc-hull-test.web.cern.ch",
  },
} as const;

// Use this configuration if you run everything locally
// const DEFAULT_CONFIG = DefaultConfigs.LOCAL;

// Use this configuration if you run the backend locally, but you use KeyCloak YCC-DEV from CERN OKD
//
// Note: if you run YCC Hull locally, make sure that it connects to the same database at CERN as Keycloak realm YCC-DEV
const DEFAULT_CONFIG = DefaultConfigs.DEV_WITH_LOCAL_HULL;

// Use this configuration if you only run the frontend locally and you use KeyCloak YCC-DEV and YCC Hull from CERN OKD
// const DEFAULT_CONFIG = DefaultConfigs.DEV;

const config: Config = {
  environment:
    Environment[
      import.meta.env.VITE_APP_ENVIRONMENT as keyof typeof Environment
    ] ?? DEFAULT_CONFIG.environment,
  keycloakServerUrl:
    import.meta.env.VITE_APP_KEYCLOAK_SERVER_URL ??
    DEFAULT_CONFIG.keycloakServerUrl,
  keycloakRealm:
    import.meta.env.VITE_APP_KEYCLOAK_REALM ?? DEFAULT_CONFIG.keycloakRealm,
  keycloakClient:
    import.meta.env.VITE_APP_KEYCLOAK_CLIENT ?? DEFAULT_CONFIG.keycloakClient,
  yccHullUrl:
    import.meta.env.VITE_APP_YCC_HULL_URL ?? DEFAULT_CONFIG.yccHullUrl,
};

export { Environment };
export default config;
