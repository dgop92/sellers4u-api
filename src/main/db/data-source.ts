import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { DataSource } from "typeorm";
import { authORMEntities } from "@features/auth/infrastructure/orm/entities";
import { businessORMEntities } from "@features/business/infrastructure/orm/entities";

const allEntities = [...authORMEntities, ...businessORMEntities];

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
  entities: allEntities,
  name: "default",
});
