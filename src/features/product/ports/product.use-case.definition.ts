import { SLPaginationResult } from "@common/types/common-types";
import { AppUser } from "@features/auth/entities/app-user";

import { Product } from "../entities/product";
import {
  ProductCreateInput,
  ProductSearchInput,
  ProductUpdateInput,
} from "../schema-types";

export type ProductLookUpInput = {
  id: number;
};

export interface IProductUseCase {
  create(input: ProductCreateInput, appUser: AppUser): Promise<Product>;
  create(
    input: ProductCreateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Product>;
  update(input: ProductUpdateInput, appUser: AppUser): Promise<Product>;
  update(
    input: ProductUpdateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Product>;
  delete(input: ProductLookUpInput, appUser: AppUser): Promise<void>;
  delete(
    input: ProductLookUpInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<void>;
  getOneBy(input: ProductSearchInput): Promise<Product | undefined>;
  getOneBy(
    input: ProductSearchInput,
    transactionManager: any
  ): Promise<Product | undefined>;
  getManyBy(input: ProductSearchInput): Promise<SLPaginationResult<Product>>;
}
