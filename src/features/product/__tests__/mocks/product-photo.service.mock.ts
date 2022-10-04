import {
  IProductPhotoService,
  ProductPhotoSimplified,
} from "@features/product/ports/product-photo/product-photo.service.definition";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

function generateImageId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function createUrlFromImageId(imageId: string) {
  return `https://example.com/${imageId}`;
}

export class ProductPhotoMockService implements IProductPhotoService {
  public static IMAGES: ProductPhotoSimplified[] = [];

  saveAsBase64(base64image: string): Promise<ProductPhotoSimplified> {
    myLogger.info("saving image to mock service");
    const imageId = generateImageId();
    const photoUrl = {
      imageId: imageId,
      url: createUrlFromImageId(imageId),
    };
    ProductPhotoMockService.IMAGES.push(photoUrl);
    return Promise.resolve(photoUrl);
  }

  async delete(imageId: string): Promise<void> {
    ProductPhotoMockService.IMAGES = ProductPhotoMockService.IMAGES.filter(
      (image) => image.imageId !== imageId
    );
    myLogger.info("deleting image from mock service");
  }
}
