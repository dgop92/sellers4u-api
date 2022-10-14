import { DataSource } from "typeorm";
import { authFactory } from "@features/auth/factories";
import { businessModuleFactory } from "@features/business/factories";
import { productModuleFactory } from "@features/product/factories";
import { ProductUseCase } from "@features/product/use-cases/product.use-case";

export function setupFactories(dataSource: DataSource) {
  authFactory(dataSource);
  const { businessFactory } = businessModuleFactory(dataSource);
  const { productFactory, categoryFactory } = productModuleFactory(dataSource);
  const productUseCase = productFactory.productUseCase as ProductUseCase;
  productUseCase.setDependencies(
    businessFactory.businessUseCase,
    categoryFactory.categoryUseCase
  );
}
