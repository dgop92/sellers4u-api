import { v2 as cloudinary } from "cloudinary";
import { ProductPhoto } from "@features/product/entities/product-photo";
import { IProductPhotoService } from "@features/product/ports/product-photo/product-photo.service.definition";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class ProductPhotoService implements IProductPhotoService {
  private readonly folderName: string;

  constructor(baseFolder: string) {
    this.folderName = `/${baseFolder}/product-photos/`;
  }

  async saveAsBase64(base64image: string): Promise<ProductPhoto> {
    myLogger.info("saving image to cloudinary");
    const result = await cloudinary.uploader.upload(base64image, {
      folder: this.folderName,
    });
    return {
      imageId: result.public_id,
      url: result.secure_url,
    };
  }

  async delete(imageId: string): Promise<void> {
    myLogger.info("deleting image from cloudinary");
    await cloudinary.uploader.destroy(imageId);
  }
}
