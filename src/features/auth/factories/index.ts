import { DataSource } from "typeorm";
import { myAppUserFactory } from "./app-user.factory";
import { myAuthUserFactory } from "./auth-user.factory";
import { myUserServiceFactory } from "./user-service-factory";

export function authFactory(dataSource?: DataSource) {
  const authUserFactory = myAuthUserFactory();
  const appUserFactory = myAppUserFactory(dataSource);
  const userServiceFactory = myUserServiceFactory(
    authUserFactory.authUserUseCase,
    appUserFactory.appUserUseCase
  );
  return {
    authUserFactory,
    appUserFactory,
    userServiceFactory,
  };
}
