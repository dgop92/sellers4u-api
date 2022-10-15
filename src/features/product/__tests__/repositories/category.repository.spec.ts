import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Category } from "@features/product/entities/category";
import { myCategoryFactory } from "@features/product/factories/category/category.factory";
import { CategoryRepository } from "@features/product/infrastructure/orm/repositories/category.repository";
import { TestDBHelper } from "test/test-db-helper";
import { TEST_CATEGORIES } from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("category repository", () => {
  let categoryRepository: CategoryRepository;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const ds = TestDBHelper.instance.datasource;
    const categoryFactory = myCategoryFactory(ds);
    categoryRepository =
      categoryFactory.categoryRepository as CategoryRepository;
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await TestDBHelper.instance.clear();
    });

    it("should create a category", async () => {
      const inputData = TEST_CATEGORIES.category1;
      const category = await categoryRepository.create(inputData);
      expect(category).toMatchObject(inputData);

      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { id: category.id },
      });
      expect(categoryRetrieved).toBeDefined();
    });
  });

  describe("Update", () => {
    let category1: Category;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      category1 = await categoryRepository.create(TEST_CATEGORIES.category1);
    });

    it("should update a category", async () => {
      const inputData = {
        name: "test category updated",
      };
      const category = await categoryRepository.update(category1, inputData);
      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { id: category.id },
      });
      expect(categoryRetrieved).toMatchObject({
        ...inputData,
        id: category.id,
      });
    });
  });

  describe("Delete", () => {
    let category1: Category;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      category1 = await categoryRepository.create(TEST_CATEGORIES.category1);
    });

    it("should delete a category", async () => {
      await categoryRepository.delete(category1);
      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { id: category1.id },
      });
      expect(categoryRetrieved).toBeUndefined();
    });
  });

  describe("Delete All", () => {
    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      await Promise.all([
        categoryRepository.create(TEST_CATEGORIES.category1),
        categoryRepository.create(TEST_CATEGORIES.category2),
        categoryRepository.create(TEST_CATEGORIES.category3),
      ]);
    });

    it("should delete all categories", async () => {
      await categoryRepository.deleteAll();
      const categoryRetrieved = await categoryRepository.getManyBy({});
      expect(categoryRetrieved).toHaveLength(0);
    });
  });

  describe("Get one by", () => {
    let category1: Category;

    beforeAll(async () => {
      await TestDBHelper.instance.clear();
      category1 = await categoryRepository.create(TEST_CATEGORIES.category1);
    });

    it("should get a category by id", async () => {
      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { id: category1.id },
      });
      expect(categoryRetrieved).toBeDefined();
    });
    it("should get a category by name", async () => {
      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { name: "fo" },
      });
      expect(categoryRetrieved).toBeDefined();
      expect(categoryRetrieved).toMatchObject(TEST_CATEGORIES.category1);
    });
    it("should not get a category by id", async () => {
      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { id: 123 },
      });
      expect(categoryRetrieved).toBeUndefined();
    });
    it("should not get a category by name", async () => {
      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { name: "asdasdnmaueygasd" },
      });
      expect(categoryRetrieved).toBeUndefined();
    });
  });

  describe("Get many by", () => {
    beforeAll(async () => {
      await TestDBHelper.instance.clear();
      await Promise.all([
        categoryRepository.create(TEST_CATEGORIES.category1),
        categoryRepository.create(TEST_CATEGORIES.category2),
        categoryRepository.create(TEST_CATEGORIES.category3),
      ]);
    });
    it("should get all categories", async () => {
      const categoriesRetrieved = await categoryRepository.getManyBy({});
      expect(categoriesRetrieved).toHaveLength(3);
    });
    it("should get all categories with name ele", async () => {
      const categoriesRetrieved = await categoryRepository.getManyBy({
        searchBy: { name: "ele" },
      });
      expect(categoriesRetrieved).toHaveLength(1);
      const names = categoriesRetrieved.map((c) => c.name);
      expect(names).toContain("electronics");
    });
  });
});
