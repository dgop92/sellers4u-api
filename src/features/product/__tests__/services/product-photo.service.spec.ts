import { promises as fs } from "fs";
import { v2 as cloudinary } from "cloudinary";

import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { ProductPhotoService } from "@features/product/infrastructure/image-service/product-photo.service";
import { addBase64Prefix } from "@common/fileHelpers";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { ProductPhotoSimplified } from "@features/product/ports/product-photo/product-photo.service.definition";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

async function cloudinaryResourceExits(publicId: string) {
  // wait for cloudinary to process the image
  await new Promise((r) => setTimeout(r, 1800));
  const result = await cloudinary.search
    .expression(`public_id=${publicId}`)
    .max_results(1)
    .execute();
  return (
    result.total_count === 1 && result?.resources?.[0]?.public_id == publicId
  );
}

describe("cloudinary service", () => {
  let productPhotoService: ProductPhotoService;
  let photoProduct1: ProductPhotoSimplified;

  beforeAll(async () => {
    const baseFolder = APP_ENV_VARS.cloudinary.baseFolder;
    productPhotoService = new ProductPhotoService(baseFolder);
    await cloudinary.api.delete_resources_by_prefix(
      `${baseFolder}/product-photos`
    );
    const base64Content = await fs.readFile(
      "./src/features/product/__tests__/mocks/test-images/test-image-1.jpg",
      {
        encoding: "base64",
      }
    );
    photoProduct1 = await productPhotoService.saveAsBase64(
      addBase64Prefix("jpg", base64Content)
    );
  });

  describe("Save", () => {
    it("should save an image", async () => {
      const base64Content = await fs.readFile(
        "./src/features/product/__tests__/mocks/test-images/test-image-2.png",
        {
          encoding: "base64",
        }
      );
      const photo = await productPhotoService.saveAsBase64(
        addBase64Prefix("png", base64Content)
      );
      const photoExists = await cloudinaryResourceExits(photo.imageId);
      expect(photoExists).toBe(true);
    });
  });

  describe("Delete", () => {
    it("should delete an image", async () => {
      await productPhotoService.delete(photoProduct1.imageId);
      const photoExistsAfterDelete = await cloudinaryResourceExits(
        photoProduct1.imageId
      );
      expect(photoExistsAfterDelete).toBe(false);
    });
  });
});
