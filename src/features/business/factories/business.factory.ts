import { AppLogger } from "@common/logging/logger";
import { DataSource } from "typeorm";
import { BusinessRepository } from "../infrastructure/orm/repositories/business.repository";
import { IBusinessRepository } from "../ports/business.repository.definition";
import { IBusinessUseCase } from "../ports/business.use-case.definition";
import { BusinessUseCase } from "../use-cases/business.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let businessRepository: IBusinessRepository;
let businessUseCase: IBusinessUseCase;

export const myBusinessFactory = (dataSource?: DataSource) => {
  myLogger.info("calling businessFactory");

  if (dataSource !== undefined && businessRepository === undefined) {
    myLogger.info("creating businessRepository");
    businessRepository = new BusinessRepository(dataSource);
    myLogger.info("businessRepository created");
  }

  if (businessUseCase === undefined) {
    myLogger.info("creating businessUseCase");
    businessUseCase = new BusinessUseCase(businessRepository);
    myLogger.info("businessUseCase created");
  }

  return {
    businessRepository,
    businessUseCase,
  };
};
