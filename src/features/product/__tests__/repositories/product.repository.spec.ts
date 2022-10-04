import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { BusinessEntity } from "@features/business/infrastructure/orm/entities/business.orm";
import { Product } from "@features/product/entities/product";
import { CategoryEntity } from "@features/product/infrastructure/orm/entities/category.orm";
import { ProductEntity } from "@features/product/infrastructure/orm/entities/product.orm";
import { ProductRepository } from "@features/product/infrastructure/orm/repositories/product.repository";
import { TestDBHelper } from "test/test-db-helper";
import {
  createTestBusiness,
  createTestCategory,
  TEST_PRODUCTS,
} from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("product repository", () => {
  let productRepository: ProductRepository;
  let business1: BusinessEntity;
  let business2: BusinessEntity;
  let category1: CategoryEntity;
  let category2: CategoryEntity;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    await TestDBHelper.instance.clear();
    productRepository = new ProductRepository(TestDBHelper.instance.datasource);

    business1 = await createTestBusiness(TestDBHelper.instance.datasource, 1);
    business2 = await createTestBusiness(TestDBHelper.instance.datasource, 2);
    category1 = await createTestCategory(TestDBHelper.instance.datasource, 1);
    category2 = await createTestCategory(TestDBHelper.instance.datasource, 2);
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
    it("should throw an error if product with given code already exists", async () => {
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
      await productRepository.create({
        ...TEST_PRODUCTS.product2,
        businessId: business1.id,
        categoryId: category2.id,
      });
      await productRepository.create({
        ...TEST_PRODUCTS.product3,
        businessId: business2.id,
        categoryId: category1.id,
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
