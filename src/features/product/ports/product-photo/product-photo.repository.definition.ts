import { ProductPhoto } from "@features/product/entities/product-photo";
import {
  ProductPhotoCreateInput,
  ProductPhotoSearchInput,
} from "@features/product/schema-types";

export type ProductPhotoCreateRepoData = Pick<
  ProductPhotoCreateInput["data"],
  "productId"
> & {
  imageId: string;
  url: string;
};

export interface IProductPhotoRepository {
  create(input: ProductPhotoCreateRepoData): Promise<ProductPhoto>;
  create<T>(
    input: ProductPhotoCreateRepoData,
    transactionManager?: T
  ): Promise<ProductPhoto>;
  delete(productPhoto: ProductPhoto): Promise<void>;
  delete<T>(productPhoto: ProductPhoto, transactionManager?: T): Promise<void>;
  getOneBy(input: ProductPhotoSearchInput): Promise<ProductPhoto | undefined>;
  getOneBy<T>(
    input: ProductPhotoSearchInput,
    transactionManager?: T
  ): Promise<ProductPhoto | undefined>;
  getManyBy(input: ProductPhotoSearchInput): void;
}
