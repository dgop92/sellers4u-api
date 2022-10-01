import { AppLogger } from "@common/logging/logger";
import { DataSource } from "typeorm";
import { CategoryRepository } from "../../infrastructure/orm/repositories/category.repository";
import { ICategoryRepository } from "../../ports/category.repository.definition";
import { ICategoryUseCase } from "../../ports/category.use-case.definition";
import { CategoryUseCase } from "../../use-cases/category.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let categoryRepository: ICategoryRepository;
let categoryUseCase: ICategoryUseCase;

export const myCategoryFactory = (dataSource?: DataSource) => {
  myLogger.info("calling categoryFactory");

  if (dataSource !== undefined && categoryRepository === undefined) {
    myLogger.info("creating categoryRepository");
    categoryRepository = new CategoryRepository(dataSource);
    myLogger.info("categoryRepository created");
  }

  if (categoryUseCase === undefined) {
    myLogger.info("creating categoryUseCase");
    categoryUseCase = new CategoryUseCase(categoryRepository);
    myLogger.info("categoryUseCase created");
  }

  return {
    categoryRepository,
    categoryUseCase,
  };
};
