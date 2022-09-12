import { AppLogger } from "@common/logging/logger";
import { DataSource } from "typeorm";
import { AppUserRepository } from "../infrastructure/orm/repositories/app-user.repository";
import { IAppUserRepository } from "../ports/app-user.repository.definition";
import { IAppUserUseCase } from "../ports/app-user.use-case.definition";
import { AppUserUseCase } from "../use-cases/app-user.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let appUserRepository: IAppUserRepository;
let appUserUseCase: IAppUserUseCase;

export const myAppUserFactory = (dataSource?: DataSource) => {
  myLogger.info("calling appUserFactory");

  if (dataSource !== undefined && appUserRepository === undefined) {
    myLogger.info("creating appUserRepository");
    appUserRepository = new AppUserRepository(dataSource);
    myLogger.info("appUserRepository created");
  }

  if (appUserUseCase === undefined) {
    myLogger.info("creating appUserUseCase");
    appUserUseCase = new AppUserUseCase(appUserRepository);
    myLogger.info("appUserUseCase created");
  }

  return {
    appUserRepository,
    appUserUseCase,
  };
};
