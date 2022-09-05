import { APP_ENV_VARS } from "../config/app-env-vars";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: APP_ENV_VARS.db.host,
  port: APP_ENV_VARS.db.port,
  username: APP_ENV_VARS.db.username,
  password: APP_ENV_VARS.db.password,
  database: APP_ENV_VARS.db.database,
  logging: APP_ENV_VARS.db.logging,
  synchronize: APP_ENV_VARS.db.synchronize,
  migrations: APP_ENV_VARS.db.migrations,
  name: "default",
});
