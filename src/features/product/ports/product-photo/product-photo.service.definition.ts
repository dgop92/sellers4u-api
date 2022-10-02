import { ProductPhoto } from "@features/product/entities/product-photo";

export interface IProductPhotoService {
  saveAsBase64(base64image: string): Promise<ProductPhoto>;
  delete(imageId: string): Promise<void>;
}
