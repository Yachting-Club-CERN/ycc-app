export enum Environment {
  PRODUCTION = "PRODUCTION",
  TEST = "TEST",
  DEVELOPMENT = "DEVELOPMENT",
  LOCAL = "LOCAL",
}

export const parseEnvironment = (env: string): Environment | undefined =>
  Object.values(Environment).includes(env as Environment)
    ? (env as Environment)
    : undefined;
