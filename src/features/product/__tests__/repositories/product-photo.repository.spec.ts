import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Product } from "@features/product/entities/product";
import { ProductPhoto } from "@features/product/entities/product-photo";
import { myProductPhotoFactory } from "@features/product/factories/product-photo.factory";
import { myProductFactory } from "@features/product/factories/product.factory";
import { ProductPhotoEntity } from "@features/product/infrastructure/orm/entities/product-photo.orm";
import { ProductPhotoRepository } from "@features/product/infrastructure/orm/repositories/product-photo.repository";
import { TestDBHelper } from "test/test-db-helper";
import {
  createTestBusiness,
  createTestCategory,
  TEST_PRODUCTS,
  TEST_PRODUCT_PHOTOS,
} from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("product-photo repository", () => {
  let productPhotoRepository: ProductPhotoRepository;
  let product1: Product;
  let product2: Product;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const ds = TestDBHelper.instance.datasource;

    const productPhotoFactory = myProductPhotoFactory(ds);
    const productFactory = myProductFactory(ds);

    productPhotoRepository =
      productPhotoFactory.productPhotoRepository as ProductPhotoRepository;

    const productRepository = productFactory.productRepository;

    const business1 = await createTestBusiness(ds, 1);
    const category1 = await createTestCategory(ds, 1);

    product1 = await productRepository.create({
      ...TEST_PRODUCTS.product1,
      businessId: business1.id,
      categoryId: category1.id,
    });
    product2 = await productRepository.create({
      ...TEST_PRODUCTS.product2,
      businessId: business1.id,
      categoryId: category1.id,
    });
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await TestDBHelper.instance.clearTable(ProductPhotoEntity);
    });

    it("should create a product photo", async () => {
      const inputData = TEST_PRODUCT_PHOTOS.productPhoto1;
      const productPhoto = await productPhotoRepository.create({
        ...inputData,
        productId: product1.id,
      });
      expect(productPhoto).toMatchObject(inputData);
      const productPhotoRetrieved = await productPhotoRepository.getOneBy({
        searchBy: { imageId: productPhoto.imageId },
      });
      expect(productPhotoRetrieved).toBeDefined();
    });
    it("should throw an error if try to add the same photo to the same product", async () => {
      const inputData = TEST_PRODUCT_PHOTOS.productPhoto1;
      await productPhotoRepository.create({
        ...inputData,
        productId: product1.id,
      });
      try {
        await productPhotoRepository.create({
          ...inputData,
          productId: product1.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.message).toMatch(/imageId/i);
        }
      }
    });
  });

  describe("Delete", () => {
    let productPhoto1: ProductPhoto;

    beforeEach(async () => {
      await TestDBHelper.instance.clearTable(ProductPhotoEntity);
      productPhoto1 = await productPhotoRepository.create({
        ...TEST_PRODUCT_PHOTOS.productPhoto1,
        productId: product1.id,
      });
    });

    it("should delete a product photo", async () => {
      await productPhotoRepository.delete(productPhoto1);
      const productPhotoRetrieved = await productPhotoRepository.getOneBy({
        searchBy: { imageId: productPhoto1.imageId },
      });
      expect(productPhotoRetrieved).toBeUndefined();
    });
  });

  describe("Get one by", () => {
    let productPhoto1: ProductPhoto;

    beforeAll(async () => {
      await TestDBHelper.instance.clearTable(ProductPhotoEntity);
      productPhoto1 = await productPhotoRepository.create({
        ...TEST_PRODUCT_PHOTOS.productPhoto1,
        productId: product1.id,
      });
    });

    it("should get a product photo by image id", async () => {
      const productPhotoRetrieved = await productPhotoRepository.getOneBy({
        searchBy: { imageId: productPhoto1.imageId },
      });
      expect(productPhotoRetrieved).toBeDefined();
    });
    it("should not get a product photo by imageId", async () => {
      const productPhotoRetrieved = await productPhotoRepository.getOneBy({
        searchBy: { imageId: "123" },
      });
      expect(productPhotoRetrieved).toBeUndefined();
    });
  });

  describe("Get many by", () => {
    beforeAll(async () => {
      await TestDBHelper.instance.clearTable(ProductPhotoEntity);
      await Promise.all([
        productPhotoRepository.create({
          ...TEST_PRODUCT_PHOTOS.productPhoto1,
          productId: product1.id,
        }),
        productPhotoRepository.create({
          ...TEST_PRODUCT_PHOTOS.productPhoto2,
          productId: product2.id,
        }),
        productPhotoRepository.create({
          ...TEST_PRODUCT_PHOTOS.productPhoto3,
          productId: product1.id,
        }),
      ]);
    });
    it("should get all product photos", async () => {
      const productPhotosRetrieved = await productPhotoRepository.getManyBy({});
      expect(productPhotosRetrieved).toHaveLength(3);
    });
    it("should get all product photos of product1", async () => {
      const productPhotosRetrieved = await productPhotoRepository.getManyBy({
        searchBy: { productId: product1.id },
      });
      expect(productPhotosRetrieved).toHaveLength(2);
      const imageIds = productPhotosRetrieved.map((p) => p.imageId);
      expect(imageIds.sort()).toEqual(
        [
          TEST_PRODUCT_PHOTOS.productPhoto1.imageId,
          TEST_PRODUCT_PHOTOS.productPhoto3.imageId,
        ].sort()
      );
    });
  });
});
