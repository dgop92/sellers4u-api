import { DataSource } from "typeorm";
import { myBusinessFactory } from "./business.factory";

export function businessModuleFactory(dataSource?: DataSource) {
  const businessFactory = myBusinessFactory(dataSource);
  return {
    businessFactory,
  };
}
