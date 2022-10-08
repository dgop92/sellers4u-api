import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { BusinessEntity } from "@features/business/infrastructure/orm/entities/business.orm";
import { Product } from "@features/product/entities/product";
import { ProductPhoto } from "@features/product/entities/product-photo";
import { ProductPhotoMockService } from "@features/product/infrastructure/image-service/product-photo.service.mock";
import { CategoryEntity } from "@features/product/infrastructure/orm/entities/category.orm";
import { ProductPhotoEntity } from "@features/product/infrastructure/orm/entities/product-photo.orm";
import { ProductPhotoRepository } from "@features/product/infrastructure/orm/repositories/product-photo.repository";
import { ProductRepository } from "@features/product/infrastructure/orm/repositories/product.repository";
import { IProductPhotoService } from "@features/product/ports/product-photo/product-photo.service.definition";
import { ProductPhotoUseCase } from "@features/product/use-cases/product-photo.use-case";
import { TestDBHelper } from "test/test-db-helper";
import {
  createTestBusiness,
  createTestCategory,
  TEST_PRODUCTS,
} from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("product-photo use-case", () => {
  let productPhotoRepository: ProductPhotoRepository;
  let productRepository: ProductRepository;
  let productPhotoUseCase: ProductPhotoUseCase;
  let photoService: IProductPhotoService;

  let business1: BusinessEntity;
  let category1: CategoryEntity;
  let product1: Product;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    productPhotoRepository = new ProductPhotoRepository(
      TestDBHelper.instance.datasource
    );

    photoService = new ProductPhotoMockService();
    productPhotoUseCase = new ProductPhotoUseCase(
      productPhotoRepository,
      photoService
    );
    productRepository = new ProductRepository(TestDBHelper.instance.datasource);

    business1 = await createTestBusiness(TestDBHelper.instance.datasource, 1);
    category1 = await createTestCategory(TestDBHelper.instance.datasource, 1);
    product1 = await productRepository.create({
      ...TEST_PRODUCTS.product1,
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

    it("should create a product-photo", async () => {
      const productPhoto = await productPhotoUseCase.create({
        data: { image: "dummy_image", productId: product1.id },
      });
      const productPhotoRetrieved = await productPhotoRepository.getOneBy({
        searchBy: { imageId: productPhoto.imageId },
      });
      expect(productPhotoRetrieved).toBeDefined();
    });
  });

  describe("Delete", () => {
    let productPhoto1: ProductPhoto;

    beforeEach(async () => {
      await TestDBHelper.instance.clearTable(ProductPhotoEntity);
      productPhoto1 = await productPhotoUseCase.create({
        data: { image: "dummy_image", productId: product1.id },
      });
    });

    it("should delete a product-photo", async () => {
      await productPhotoUseCase.delete({ imageId: productPhoto1.imageId });
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
      productPhoto1 = await productPhotoUseCase.create({
        data: { image: "dummy_image", productId: product1.id },
      });
    });

    it("should get a productPhoto by id", async () => {
      const productPhotoRetrieved = await productPhotoUseCase.getOneBy({
        searchBy: { imageId: productPhoto1.imageId },
      });
      expect(productPhotoRetrieved).toBeDefined();
    });
    it("should not get a productPhoto by id", async () => {
      const productPhotoRetrieved = await productPhotoUseCase.getOneBy({
        searchBy: { imageId: "123" },
      });
      expect(productPhotoRetrieved).toBeUndefined();
    });
  });

  describe("Get many by", () => {
    let product2: Product;

    beforeAll(async () => {
      await TestDBHelper.instance.clearTable(ProductPhotoEntity);
      product2 = await productRepository.create({
        ...TEST_PRODUCTS.product2,
        businessId: business1.id,
        categoryId: category1.id,
      });
      await Promise.all([
        productPhotoUseCase.create({
          data: {
            image: "dummy_image",
            productId: product1.id,
          },
        }),
        productPhotoUseCase.create({
          data: {
            image: "dummy_image",
            productId: product1.id,
          },
        }),
        productPhotoUseCase.create({
          data: {
            image: "dummy_image",
            productId: product2.id,
          },
        }),
      ]);
    });

    it("should get all product photos by product id", async () => {
      const productPhotosRetrieved = await productPhotoUseCase.getManyBy({});
      expect(productPhotosRetrieved).toHaveLength(3);
    });
    it("should get all products", async () => {
      const productPhotosRetrieved = await productPhotoUseCase.getManyBy({
        searchBy: { productId: product1.id },
      });
      expect(productPhotosRetrieved).toHaveLength(2);
    });
  });
});
