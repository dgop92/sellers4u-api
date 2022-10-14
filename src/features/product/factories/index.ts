import { DataSource } from "typeorm";
import { myCategoryFactory } from "./category/category.factory";
import { myProductFactory } from "./product.factory";

export function productModuleFactory(dataSource?: DataSource) {
  const categoryFactory = myCategoryFactory(dataSource);
  const productFactory = myProductFactory(dataSource);
  return {
    categoryFactory,
    productFactory,
  };
}
