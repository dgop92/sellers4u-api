import "reflect-metadata";
import { DataSource } from "typeorm";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { authORMEntities } from "@features/auth/infrastructure/orm/entities";

const allEntities = [...authORMEntities];

export const TestDataSource = new DataSource({
  type: "postgres",
  host: APP_ENV_VARS.db.host,
  port: APP_ENV_VARS.db.port,
  username: APP_ENV_VARS.db.username,
  password: APP_ENV_VARS.db.password,
  database: APP_ENV_VARS.db.database,
  logging: APP_ENV_VARS.db.logging,
  synchronize: APP_ENV_VARS.db.synchronize,
  migrations: APP_ENV_VARS.db.migrations,
  entities: allEntities,
  name: "default",
});
