import {
  getOsEnv,
  getOsEnvOrDefault,
  getOsPath,
  parseBoolOrThrow,
  parseIntOrThrow,
} from "./env-utils";

export const APP_ENV_VARS = {
  NODE_ENV: getOsEnv("NODE_ENV"),
  isProduction: getOsEnv("NODE_ENV") === "prod",
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
  firebase: {
    credentialsPath: getOsPath("GOOGLE_APPLICATION_CREDENTIALS"),
  },
};
