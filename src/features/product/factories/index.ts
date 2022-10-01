import { DataSource } from "typeorm";
import { myCategoryFactory } from "./category/category.factory";

export function productModuleFactory(dataSource?: DataSource) {
  const categoryFactory = myCategoryFactory(dataSource);
  return {
    categoryFactory,
  };
}
