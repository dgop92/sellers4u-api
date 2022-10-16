import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { myBusinessFactory } from "@features/business/factories/business.factory";
import { BusinessEntity } from "@features/business/infrastructure/orm/entities/business.orm";
import { BusinessRepository } from "@features/business/infrastructure/orm/repositories/business.repository";
import { Product } from "@features/product/entities/product";
import { myProductPhotoFactory } from "@features/product/factories/product-photo.factory";
import { myProductFactory } from "@features/product/factories/product.factory";
import { CategoryEntity } from "@features/product/infrastructure/orm/entities/category.orm";
import { ProductEntity } from "@features/product/infrastructure/orm/entities/product.orm";
import { ProductPhotoRepository } from "@features/product/infrastructure/orm/repositories/product-photo.repository";
import { ProductRepository } from "@features/product/infrastructure/orm/repositories/product.repository";
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

describe("product repository", () => {
  let productRepository: ProductRepository;
  let productPhotoRepository: ProductPhotoRepository;
  let businessRepository: BusinessRepository;
  let business1: BusinessEntity;
  let business2: BusinessEntity;
  let category1: CategoryEntity;
  let category2: CategoryEntity;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const ds = TestDBHelper.instance.datasource;

    const productPhotoFactory = myProductPhotoFactory(ds);
    const productFactory = myProductFactory(ds);
    const businessFactory = myBusinessFactory(ds);

    productPhotoRepository =
      productPhotoFactory.productPhotoRepository as ProductPhotoRepository;
    productRepository = productFactory.productRepository as ProductRepository;
    businessRepository =
      businessFactory.businessRepository as BusinessRepository;

    business1 = await createTestBusiness(ds, 1);
    business2 = await createTestBusiness(ds, 2);
    category1 = await createTestCategory(ds, 1);
    category2 = await createTestCategory(ds, 2);
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await TestDBHelper.instance.clearTable(ProductEntity);
      await productRepository.create({
        ...TEST_PRODUCTS.product1,
        businessId: business1.id,
        categoryId: category1.id,
      });
    });

    it("should create a product", async () => {
      const inputData = TEST_PRODUCTS.product2;
      const product = await productRepository.create({
        ...inputData,
        businessId: business1.id,
        categoryId: category1.id,
      });
      expect(product).toMatchObject(inputData);

      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product.id },
      });
      expect(productRetrieved).toBeDefined();
    });
    it("should create a product with the same code use in another business", async () => {
      const inputData = TEST_PRODUCTS.product1;
      const product = await productRepository.create({
        ...inputData,
        businessId: business2.id,
        categoryId: category1.id,
      });
      expect(product).toMatchObject(inputData);

      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product.id },
      });
      expect(productRetrieved).toBeDefined();
    });
    it("should throw an error if product with given code already exists inside a business", async () => {
      try {
        await productRepository.create({
          ...TEST_PRODUCTS.product1,
          businessId: business1.id,
          categoryId: category1.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.message).toMatch(/code/i);
        }
      }
    });
  });

  describe("Update", () => {
    let product1: Product;

    beforeEach(async () => {
      await TestDBHelper.instance.clearTable(ProductEntity);
      product1 = await productRepository.create({
        ...TEST_PRODUCTS.product1,
        businessId: business1.id,
        categoryId: category1.id,
      });
    });

    it("should update basic product data", async () => {
      const inputData = {
        description: "test product description updated",
        price: 10000,
        code: "test-product-code-updated",
      };
      const product = await productRepository.update(product1, inputData);
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product.id },
      });
      expect(productRetrieved).toMatchObject({
        ...inputData,
        id: product.id,
      });
    });
    it("should update a product with the same code use in another business", async () => {
      const initialProduct = await productRepository.create({
        ...TEST_PRODUCTS.product2,
        businessId: business2.id,
        categoryId: category1.id,
      });
      const inputData = {
        name: "test product updated",
        code: product1.code,
        description: "test product description updated",
      };
      const product = await productRepository.update(initialProduct, inputData);
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product.id },
      });
      expect(productRetrieved).toMatchObject({
        ...inputData,
        id: product.id,
      });
    });
    it("should throw an error if try to update a product with a code that is already in use", async () => {
      await productRepository.create({
        ...TEST_PRODUCTS.product2,
        businessId: business1.id,
        categoryId: category1.id,
      });
      const inputData = {
        name: "test product updated",
        code: TEST_PRODUCTS.product2.code,
      };
      try {
        await productRepository.update(product1, inputData);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.message).toMatch(/code/i);
        }
      }
    });
  });

  describe("Delete", () => {
    let product1: Product;

    beforeEach(async () => {
      await TestDBHelper.instance.clearTable(ProductEntity);
      product1 = await productRepository.create({
        ...TEST_PRODUCTS.product1,
        businessId: business1.id,
        categoryId: category1.id,
      });
    });

    it("should delete a product", async () => {
      await productRepository.delete(product1);
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should delete all product if business is deleted", async () => {
      const business3 = await createTestBusiness(
        TestDBHelper.instance.datasource,
        3
      );
      await productRepository.create({
        ...TEST_PRODUCTS.product1,
        businessId: business3.id,
        categoryId: category1.id,
      });
      await productRepository.create({
        ...TEST_PRODUCTS.product2,
        businessId: business3.id,
        categoryId: category1.id,
      });
      await businessRepository.delete(business3);
      const products = await productRepository.getManyBy({
        searchBy: { businessId: business3.id },
      });
      expect(products.count).toBe(0);
    });
  });

  describe("Get one by", () => {
    let product1: Product;

    beforeAll(async () => {
      await TestDBHelper.instance.clearTable(ProductEntity);
      product1 = await productRepository.create({
        ...TEST_PRODUCTS.product1,
        businessId: business1.id,
        categoryId: category1.id,
      });
      const product2 = await productRepository.create({
        ...TEST_PRODUCTS.product2,
        businessId: business1.id,
        categoryId: category2.id,
      });
      await productRepository.create({
        ...TEST_PRODUCTS.product3,
        businessId: business2.id,
        categoryId: category1.id,
      });
      await productPhotoRepository.create({
        productId: product1.id,
        ...TEST_PRODUCT_PHOTOS.productPhoto1,
      });
      await productPhotoRepository.create({
        productId: product1.id,
        ...TEST_PRODUCT_PHOTOS.productPhoto2,
      });
      await productPhotoRepository.create({
        productId: product2.id,
        ...TEST_PRODUCT_PHOTOS.productPhoto3,
      });
    });

    it("should get a product by id", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved).toMatchObject(TEST_PRODUCTS.product1);
    });
    it("should get a product by name", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { name: "product1" },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved).toMatchObject(TEST_PRODUCTS.product1);
    });
    it("should get a product by code", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { code: "product1-code" },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved).toMatchObject(TEST_PRODUCTS.product1);
    });
    it("should get a product by id and businessId", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id, businessId: business1.id },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved).toMatchObject(TEST_PRODUCTS.product1);
    });
    it("should not get a product by id", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: 123 },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should not get a product by name", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { name: "asdasdnmaueygasd" },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should not get a product by code", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { code: "product1-code-asdasd" },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should not get a product by id and businessId", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id, businessId: business2.id },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should get a product by id and load its category", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id },
        options: { fetchCategory: true },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved?.category).toBeDefined();
      expect(productRetrieved?.category?.id).toBe(category1.id);
    });
    it("should get a product by id and load its business", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id },
        options: { fetchBusiness: true },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved?.business).toBeDefined();
      expect(productRetrieved?.business?.id).toBe(business1.id);
    });
    it("should get a product by id and load its photos", async () => {
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id },
        options: { fetchPhotos: true },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved?.photos).toBeDefined();
      const photoImageIds = productRetrieved?.photos?.map(
        (photo) => photo.imageId
      );
      expect(photoImageIds).toContain(
        TEST_PRODUCT_PHOTOS.productPhoto1.imageId
      );
      expect(photoImageIds).toContain(
        TEST_PRODUCT_PHOTOS.productPhoto2.imageId
      );
    });
  });

  describe("Get many by", () => {
    beforeAll(async () => {
      await TestDBHelper.instance.clearTable(ProductEntity);
      await Promise.all([
        productRepository.create({
          ...TEST_PRODUCTS.product1,
          businessId: business1.id,
          categoryId: category1.id,
        }),
        productRepository.create({
          ...TEST_PRODUCTS.product2,
          businessId: business1.id,
          categoryId: category2.id,
        }),
        productRepository.create({
          ...TEST_PRODUCTS.product3,
          businessId: business2.id,
          categoryId: category1.id,
        }),
      ]);
    });

    it("should get all products", async () => {
      const productsRetrieved = await productRepository.getManyBy({});
      expect(productsRetrieved.count).toBe(3);
      expect(productsRetrieved.results).toHaveLength(3);
    });
    it("should get all products and load it categories", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        options: { fetchCategory: true },
      });
      expect(productsRetrieved.count).toBe(3);
      expect(productsRetrieved.results).toHaveLength(3);
      const categories = productsRetrieved.results.map((p) => p.category);
      categories.forEach((c) => expect(c).toBeDefined());
    });
    it("should get all products and load it business", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        options: { fetchBusiness: true },
      });
      expect(productsRetrieved.count).toBe(3);
      expect(productsRetrieved.results).toHaveLength(3);
      const businesses = productsRetrieved.results.map((p) => p.business);
      businesses.forEach((b) => expect(b).toBeDefined());
    });
    it("should get all products with pagination", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        pagination: { limit: 2, skip: 1 },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
    });
    it("should get all products with name product", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        searchBy: { name: "product" },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
      const names = productsRetrieved.results.map((p) => p.name);
      expect(names.sort()).toEqual(
        [TEST_PRODUCTS.product1.name, TEST_PRODUCTS.product2.name].sort()
      );
    });
    it("should get all products containing 'anormal' in description", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        searchBy: { description: "anormal" },
      });
      expect(productsRetrieved.count).toBe(1);
      expect(productsRetrieved.results).toHaveLength(1);
      expect(productsRetrieved.results[0].description).toBe(
        TEST_PRODUCTS.product2.description
      );
    });
    it("should get all products filter by business ", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        searchBy: { businessId: business1.id },
        options: { fetchBusiness: true },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
      const businessIds = productsRetrieved.results.map((p) => p.business?.id);
      expect(businessIds.sort()).toEqual([business1.id, business1.id].sort());
    });
    it("should get all products filter by category ", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        searchBy: { categoryId: category1.id },
        options: { fetchCategory: true },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
      const categoryIds = productsRetrieved.results.map((p) => p.category?.id);
      expect(categoryIds.sort()).toEqual([category1.id, category1.id].sort());
    });
    it("should get all products with price gte 200", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        filterBy: { price: { min: 200 } },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
      const prices = productsRetrieved.results.map((p) => p.price);
      expect(prices.sort()).toEqual(
        [TEST_PRODUCTS.product2.price, TEST_PRODUCTS.product3.price].sort()
      );
    });
    it("should get all products with price lte 400", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        filterBy: { price: { max: 400 } },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
      const prices = productsRetrieved.results.map((p) => p.price);
      expect(prices.sort()).toEqual(
        [TEST_PRODUCTS.product2.price, TEST_PRODUCTS.product1.price].sort()
      );
    });
    it("should get all products with price gte 150 and lte 450", async () => {
      const productsRetrieved = await productRepository.getManyBy({
        filterBy: { price: { max: 450, min: 150 } },
      });
      expect(productsRetrieved.count).toBe(1);
      expect(productsRetrieved.results).toHaveLength(1);
      const prices = productsRetrieved.results.map((p) => p.price);
      expect(prices.sort()).toEqual([TEST_PRODUCTS.product2.price].sort());
    });
  });
});
