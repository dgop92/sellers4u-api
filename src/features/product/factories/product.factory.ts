import { AppLogger } from "@common/logging/logger";
import { DataSource } from "typeorm";
import { ProductRepository } from "../infrastructure/orm/repositories/product.repository";
import { IProductRepository } from "../ports/product.repository.definition";
import { IProductUseCase } from "../ports/product.use-case.definition";
import { ProductUseCase } from "../use-cases/product.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let productRepository: IProductRepository;
let productUseCase: IProductUseCase;

export const myProductFactory = (dataSource?: DataSource) => {
  myLogger.info("calling productFactory");

  if (dataSource !== undefined && productRepository === undefined) {
    myLogger.info("creating productRepository");
    productRepository = new ProductRepository(dataSource);
    myLogger.info("productRepository created");
  }

  if (productUseCase === undefined) {
    myLogger.info("creating productUseCase");
    productUseCase = new ProductUseCase(productRepository);
    myLogger.info("productUseCase created");
  }

  return {
    productRepository,
    productUseCase,
  };
};
