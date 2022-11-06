import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { DataSource } from "typeorm";
import { authORMEntities } from "@features/auth/infrastructure/orm/entities";
import { businessORMEntities } from "@features/business/infrastructure/orm/entities";
import { productORMEntities } from "@features/product/infrastructure/orm/entities";

const allEntities = [
  ...authORMEntities,
  ...businessORMEntities,
  ...productORMEntities,
];

const connOptions =
  APP_ENV_VARS.db.dbUrl !== ""
    ? {
        url: APP_ENV_VARS.db.dbUrl,
      }
    : {
        host: APP_ENV_VARS.db.host,
        port: APP_ENV_VARS.db.port,
        username: APP_ENV_VARS.db.username,
        password: APP_ENV_VARS.db.password,
        database: APP_ENV_VARS.db.database,
      };

export const AppDataSource = new DataSource({
  type: "postgres",
  ...connOptions,
  logging: APP_ENV_VARS.db.logging,
  synchronize: APP_ENV_VARS.db.synchronize,
  migrations: APP_ENV_VARS.db.migrations,
  entities: allEntities,
  name: "default",
});
