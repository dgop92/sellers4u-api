import { ApplicationError, ErrorCode } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { AppUser } from "@features/auth/entities/app-user";
import { myBusinessFactory } from "@features/business/factories/business.factory";
import { BusinessEntity } from "@features/business/infrastructure/orm/entities/business.orm";
import { Product } from "@features/product/entities/product";
import { myCategoryFactory } from "@features/product/factories/category/category.factory";
import { myProductFactory } from "@features/product/factories/product.factory";
import { CategoryEntity } from "@features/product/infrastructure/orm/entities/category.orm";
import { ProductEntity } from "@features/product/infrastructure/orm/entities/product.orm";
import { IProductRepository } from "@features/product/ports/product.repository.definition";
import { ProductUseCase } from "@features/product/use-cases/product.use-case";
import { TestDBHelper } from "test/test-db-helper";
import {
  createTestBusinessWithAppUser,
  createTestCategory,
  TEST_PRODUCTS,
} from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("product use-case", () => {
  let productRepository: IProductRepository;
  let productUseCase: ProductUseCase;
  let appUser1: AppUser;
  let appUser2: AppUser;
  let business1: BusinessEntity;
  let business2: BusinessEntity;
  let category1: CategoryEntity;
  let category2: CategoryEntity;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const ds = TestDBHelper.instance.datasource;

    const productFactory = myProductFactory(ds);
    const businessFactory = myBusinessFactory(ds);
    const categoryFactory = myCategoryFactory(ds);

    productRepository = productFactory.productRepository;
    productUseCase = productFactory.productUseCase as ProductUseCase;
    productUseCase.setDependencies(
      businessFactory.businessUseCase,
      categoryFactory.categoryUseCase
    );

    const businessAppUser1 = await createTestBusinessWithAppUser(ds, 1);
    const businessAppUser2 = await createTestBusinessWithAppUser(ds, 2);

    business1 = businessAppUser1.business;
    business2 = businessAppUser2.business;
    appUser1 = businessAppUser1.appUser;
    appUser2 = businessAppUser2.appUser;

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
      const product = await productUseCase.create(
        {
          data: {
            ...TEST_PRODUCTS.product2,
            businessId: business1.id,
            categoryId: category1.id,
          },
        },
        appUser1
      );
      expect(product).toMatchObject(TEST_PRODUCTS.product2);
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product.id },
      });
      expect(productRetrieved).toBeDefined();
    });
    it("should throw an error if try to create a product in a business that doesn't belong to you", async () => {
      try {
        await productUseCase.create(
          {
            data: {
              ...TEST_PRODUCTS.product1,
              businessId: business1.id,
              categoryId: category1.id,
            },
          },
          appUser2
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.FORBIDDEN);
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

    it("should update a product", async () => {
      const inputData = {
        name: "test product updated",
        description: "test product description updated",
      };
      const product = await productUseCase.update(
        {
          data: inputData,
          searchBy: { id: product1.id },
        },
        appUser1
      );

      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product.id },
      });
      expect(productRetrieved).toMatchObject({
        ...inputData,
        id: product.id,
      });
    });
    it("should update a product category", async () => {
      const inputData = {
        categoryId: category2.id,
      };
      await productUseCase.update(
        { data: inputData, searchBy: { id: product1.id } },
        appUser1
      );

      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id },
        options: { fetchCategory: true },
      });
      expect(productRetrieved?.category?.id).toBe(category2.id);
    });
    it("should throw an error if try to update a product with a category that does not exit", async () => {
      try {
        await productUseCase.update(
          {
            data: {
              categoryId: 1425,
            },
            searchBy: { id: product1.id },
          },
          appUser1
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
    it("should throw an error if try to update a product in a business that doesn't belong to you", async () => {
      try {
        const inputData = {
          name: "test product updated",
          description: "test product description updated",
        };
        await productUseCase.update(
          {
            data: inputData,
            searchBy: { id: product1.id },
          },
          appUser2
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
    it("should throw an error if product is not found", async () => {
      try {
        const inputData = {
          name: "test product updated",
          description: "test product description updated",
        };
        await productUseCase.update(
          {
            data: inputData,
            searchBy: { id: 1234 },
          },
          appUser2
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
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
      await productUseCase.delete({ id: product1.id }, appUser1);
      const productRetrieved = await productRepository.getOneBy({
        searchBy: { id: product1.id },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should throw an error if try to delete a product in a business that doesn't belong to you", async () => {
      try {
        await productUseCase.delete({ id: product1.id }, appUser2);
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
    it("should throw an error if product is not found", async () => {
      try {
        await productUseCase.delete({ id: 1234 }, appUser2);
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
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
    });

    it("should get a product by id", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { id: product1.id },
      });
      expect(productRetrieved).toBeDefined();
    });
    it("should get a product by name", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { name: product1.name },
      });
      expect(productRetrieved).toBeDefined();
    });
    it("should get a product by code", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { code: "product1-code" },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved).toMatchObject(TEST_PRODUCTS.product1);
    });
    it("should get a product by id and businessId", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { id: product1.id, businessId: business1.id },
      });
      expect(productRetrieved).toBeDefined();
      expect(productRetrieved).toMatchObject(TEST_PRODUCTS.product1);
    });
    it("should not get a product by id", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { id: 123 },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should not get a product by name", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { name: "asdasdnmaueygasd" },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should not get a product by code", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { code: "product1-code-asdasd" },
      });
      expect(productRetrieved).toBeUndefined();
    });
    it("should not get a product by id and businessId", async () => {
      const productRetrieved = await productUseCase.getOneBy({
        searchBy: { id: product1.id, businessId: business2.id },
      });
      expect(productRetrieved).toBeUndefined();
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
      const productsRetrieved = await productUseCase.getManyBy({});
      expect(productsRetrieved.count).toBe(3);
      expect(productsRetrieved.results).toHaveLength(3);
    });
    it("should get all products and load it categories", async () => {
      const productsRetrieved = await productUseCase.getManyBy({
        options: { fetchCategory: true },
      });
      expect(productsRetrieved.count).toBe(3);
      expect(productsRetrieved.results).toHaveLength(3);
      const categories = productsRetrieved.results.map((p) => p.category);
      categories.forEach((c) => expect(c).toBeDefined());
    });
    it("should get all products and load it business", async () => {
      const productsRetrieved = await productUseCase.getManyBy({
        options: { fetchBusiness: true },
      });
      expect(productsRetrieved.count).toBe(3);
      expect(productsRetrieved.results).toHaveLength(3);
      const businesses = productsRetrieved.results.map((p) => p.business);
      businesses.forEach((b) => expect(b).toBeDefined());
    });
    it("should get all products with name product", async () => {
      const productsRetrieved = await productUseCase.getManyBy({
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
      const productsRetrieved = await productUseCase.getManyBy({
        searchBy: { description: "anormal" },
      });
      expect(productsRetrieved.count).toBe(1);
      expect(productsRetrieved.results).toHaveLength(1);
      expect(productsRetrieved.results[0].description).toBe(
        TEST_PRODUCTS.product2.description
      );
    });
    it("should get all products filter by business ", async () => {
      const productsRetrieved = await productUseCase.getManyBy({
        searchBy: { businessId: business1.id },
        options: { fetchBusiness: true },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
      const businessIds = productsRetrieved.results.map((p) => p.business?.id);
      expect(businessIds.sort()).toEqual([business1.id, business1.id].sort());
    });
    it("should get all products filter by category ", async () => {
      const productsRetrieved = await productUseCase.getManyBy({
        searchBy: { categoryId: category1.id },
        options: { fetchCategory: true },
      });
      expect(productsRetrieved.count).toBe(2);
      expect(productsRetrieved.results).toHaveLength(2);
      const categoryIds = productsRetrieved.results.map((p) => p.category?.id);
      expect(categoryIds.sort()).toEqual([category1.id, category1.id].sort());
    });
    it("should get all products with price gte 200", async () => {
      const productsRetrieved = await productUseCase.getManyBy({
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
      const productsRetrieved = await productUseCase.getManyBy({
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
      const productsRetrieved = await productUseCase.getManyBy({
        filterBy: { price: { max: 450, min: 150 } },
      });
      expect(productsRetrieved.count).toBe(1);
      expect(productsRetrieved.results).toHaveLength(1);
      const prices = productsRetrieved.results.map((p) => p.price);
      expect(prices.sort()).toEqual([TEST_PRODUCTS.product2.price].sort());
    });
  });
});
