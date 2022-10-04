import { Product } from "../entities/product";
import {
  ProductCreateInput,
  ProductSearchInput,
  ProductUpdateInput,
} from "../schema-types";
import { SLPaginationResult } from "@common/types/common-types";

export type ProductCreateRepoData = ProductCreateInput["data"];
export type ProductUpdateRepoData = Omit<
  ProductUpdateInput["data"],
  "categoryId"
>;

export interface IProductRepository {
  create(input: ProductCreateRepoData): Promise<Product>;
  create<T>(
    input: ProductCreateRepoData,
    transactionManager?: T
  ): Promise<Product>;
  update(product: Product, input: ProductUpdateRepoData): Promise<Product>;
  update<T>(
    product: Product,
    input: ProductUpdateRepoData,
    transactionManager?: T
  ): Promise<Product>;
  delete(product: Product): Promise<void>;
  delete<T>(product: Product, transactionManager?: T): Promise<void>;
  getOneBy(input: ProductSearchInput): Promise<Product | undefined>;
  getOneBy<T>(
    input: ProductSearchInput,
    transactionManager?: T
  ): Promise<Product | undefined>;
  getManyBy(input: ProductSearchInput): Promise<SLPaginationResult<Product>>;
}
