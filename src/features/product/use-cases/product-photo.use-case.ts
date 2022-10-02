import { ApplicationError, ErrorCode } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import Joi from "joi";
import {
  ProductPhoto,
  ProductPhotoCreateInputSchema,
  ProductPhotoSearchInputSchema,
} from "../entities/product-photo";
import { IProductPhotoRepository } from "../ports/product-photo/product-photo.repository.definition";
import { IProductPhotoService } from "../ports/product-photo/product-photo.service.definition";
import {
  IProductPhotoUseCase,
  ProductPhotoLookUpInput,
} from "../ports/product-photo/product-photo.use-case.definition";
import {
  ProductPhotoCreateInput,
  ProductPhotoSearchInput,
} from "../schema-types";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

const ProductPhotoLookUpInputSchema = Joi.object({
  imageId: Joi.string().required(),
});

export class ProductPhotoUseCase implements IProductPhotoUseCase {
  constructor(
    private readonly repository: IProductPhotoRepository,
    private readonly photoService: IProductPhotoService
  ) {}

  // Note: if the linking to the product fails, the image will be orphaned in the image store service. Consider using a cron job to clean up orphaned images.
  create(input: ProductPhotoCreateInput): Promise<ProductPhoto>;
  create(
    input: ProductPhotoCreateInput,
    transactionManager: any
  ): Promise<ProductPhoto>;
  async create(
    input: ProductPhotoCreateInput,
    transactionManager?: any
  ): Promise<ProductPhoto> {
    this.validateInput(ProductPhotoCreateInputSchema, input);
    myLogger.debug("saving image to image store service");
    const photo = await this.photoService.saveAsBase64(input.data.image);
    myLogger.debug("linking image to product in db");
    const productPhoto = await this.repository.create(
      {
        productId: input.data.productId,
        imageId: photo.imageId,
        url: photo.url,
      },
      transactionManager
    );
    return productPhoto;
  }

  delete(input: ProductPhotoLookUpInput): Promise<void>;
  delete(
    input: ProductPhotoLookUpInput,
    transactionManager: any
  ): Promise<void>;
  async delete(
    input: ProductPhotoLookUpInput,
    transactionManager?: any
  ): Promise<void> {
    this.validateInput(ProductPhotoLookUpInputSchema, input);
    myLogger.debug("deleting image from image store service");
    await this.photoService.delete(input.imageId);
    myLogger.debug("image deleted from image store service");

    myLogger.debug("getting product photo by image id", {
      imageId: input.imageId,
    });
    const productPhoto = await this.repository.getOneBy(
      { searchBy: { imageId: input.imageId } },
      transactionManager
    );
    if (!productPhoto) {
      throw new ApplicationError(
        "product photo not found",
        ErrorCode.NOT_FOUND
      );
    }

    myLogger.debug("deleting product photo from db");
    await this.repository.delete(productPhoto, transactionManager);
    myLogger.debug("product photo deleted");
  }

  getOneBy(input: ProductPhotoSearchInput): Promise<ProductPhoto | undefined>;
  getOneBy(
    input: ProductPhotoSearchInput,
    transactionManager: any
  ): Promise<ProductPhoto | undefined>;
  getOneBy(
    input: ProductPhotoSearchInput,
    transactionManager?: unknown
  ): Promise<ProductPhoto | undefined> {
    this.validateInput(ProductPhotoSearchInputSchema, input);
    return this.repository.getOneBy(input, transactionManager);
  }

  getManyBy(input: ProductPhotoSearchInput): void {
    this.validateInput(ProductPhotoSearchInputSchema, input);
    return this.repository.getManyBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
