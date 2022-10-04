import { ProductPhoto } from "@features/product/entities/product-photo";

export type ProductPhotoSimplified = Pick<ProductPhoto, "imageId" | "url">;

export interface IProductPhotoService {
  saveAsBase64(base64image: string): Promise<ProductPhotoSimplified>;
  delete(imageId: string): Promise<void>;
}
