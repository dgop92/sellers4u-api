import { ProductPhoto } from "@features/product/entities/product-photo";
import {
  ProductPhotoCreateInput,
  ProductPhotoSearchInput,
} from "@features/product/schema-types";

export type ProductPhotoLookUpInput = {
  imageId: string;
};

export interface IProductPhotoUseCase {
  create(input: ProductPhotoCreateInput): Promise<ProductPhoto>;
  create(
    input: ProductPhotoCreateInput,
    transactionManager: any
  ): Promise<ProductPhoto>;
  delete(input: ProductPhotoLookUpInput): Promise<void>;
  delete(
    input: ProductPhotoLookUpInput,
    transactionManager: any
  ): Promise<void>;
  getOneBy(input: ProductPhotoSearchInput): Promise<ProductPhoto | undefined>;
  getOneBy(
    input: ProductPhotoSearchInput,
    transactionManager: any
  ): Promise<ProductPhoto | undefined>;
  getManyBy(input: ProductPhotoSearchInput): void;
}
