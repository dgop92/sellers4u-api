import {
  getOsEnv,
  getOsEnvOrDefault,
  getOsPath,
  parseBoolOrThrow,
  parseIntOrThrow,
} from "./env-utils";

export const APP_ENV_VARS = {
  NODE_ENV: getOsEnv("NODE_ENV"),
  port: parseIntOrThrow(process.env.PORT || getOsEnv("APP_PORT")),
  db: {
    migrations: [getOsPath("TYPEORM_MIGRATIONS")],
    migrationsDir: getOsPath("TYPEORM_MIGRATION_CLI_DIR"),
    type: getOsEnv("TYPEORM_CONNECTION"),
    host: getOsEnvOrDefault("TYPEORM_HOST", "localhost"),
    port: parseIntOrThrow(getOsEnv("TYPEORM_PORT")),
    username: getOsEnv("TYPEORM_USERNAME"),
    password: getOsEnv("TYPEORM_PASSWORD"),
    database: getOsEnv("TYPEORM_DATABASE"),
    synchronize: parseBoolOrThrow(
      getOsEnvOrDefault("TYPEORM_SYNCHRONIZE", "false")
    ),
    logging: parseBoolOrThrow(getOsEnvOrDefault("TYPEORM_LOGGING", "false")),
  },
  auth0: {
    domain: getOsEnv("AUTH0_DOMAIN"),
    clientId: getOsEnv("AUTH0_CLIENT_ID"),
    clientSecret: getOsEnv("AUTH0_CLIENT_SECRET"),
    dbConnectionName: getOsEnv("AUTH0_DB_CONNECTION_NAME"),
  },
};
