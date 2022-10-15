import { AppLogger } from "@common/logging/logger";
import { DataSource } from "typeorm";
import { ProductPhotoRepository } from "../infrastructure/orm/repositories/product-photo.repository";
import { IProductPhotoRepository } from "../ports/product-photo/product-photo.repository.definition";
import { IProductPhotoUseCase } from "../ports/product-photo/product-photo.use-case.definition";
import { IProductPhotoService } from "../ports/product-photo/product-photo.service.definition";
import { ProductPhotoUseCase } from "../use-cases/product-photo.use-case";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { ProductPhotoMockService } from "../infrastructure/image-service/product-photo.service.mock";
import { ProductPhotoService } from "../infrastructure/image-service/product-photo.service";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let productPhotoRepository: IProductPhotoRepository;
let productPhotoUseCase: IProductPhotoUseCase;
let productPhotoService: IProductPhotoService;

export const myProductPhotoFactory = (dataSource?: DataSource) => {
  myLogger.info("calling productFactory");

  if (dataSource !== undefined && productPhotoRepository === undefined) {
    myLogger.info("creating productRepository");
    productPhotoRepository = new ProductPhotoRepository(dataSource);
    myLogger.info("productRepository created");
  }

  if (productPhotoService === undefined) {
    myLogger.info("creating productPhotoService");
    if (APP_ENV_VARS.isTest) {
      productPhotoService = new ProductPhotoMockService();
    } else {
      productPhotoService = new ProductPhotoService(
        APP_ENV_VARS.cloudinary.baseFolder
      );
    }
    myLogger.info("productPhotoService created");
  }

  if (productPhotoUseCase === undefined) {
    myLogger.info("creating productUseCase");
    productPhotoUseCase = new ProductPhotoUseCase(
      productPhotoRepository,
      productPhotoService
    );
    myLogger.info("productUseCase created");
  }

  return {
    productPhotoRepository,
    productPhotoUseCase,
  };
};
