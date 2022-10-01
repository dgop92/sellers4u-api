import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Category } from "@features/product/entities/category";
import { CategoryRepository } from "@features/product/infrastructure/orm/repositories/category.repository";
import { CategoryUseCase } from "@features/product/use-cases/category.use-case";
import { TestDBHelper } from "test/test-db-helper";
import { TEST_CATEGORIES } from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("category use-case", () => {
  let categoryRepository: CategoryRepository;
  let categoryUseCase: CategoryUseCase;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    categoryRepository = new CategoryRepository(
      TestDBHelper.instance.datasource
    );
    categoryUseCase = new CategoryUseCase(categoryRepository);
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await TestDBHelper.instance.clear();
    });

    it("should create a category", async () => {
      const category = await categoryUseCase.create({
        data: TEST_CATEGORIES.category1,
      });
      expect(category).toMatchObject(TEST_CATEGORIES.category1);

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
        description: "test category description updated",
      };
      const category = await categoryUseCase.update({
        data: inputData,
        searchBy: { id: category1.id },
      });
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
      await categoryUseCase.delete({ id: category1.id });
      const categoryRetrieved = await categoryRepository.getOneBy({
        searchBy: { id: category1.id },
      });
      expect(categoryRetrieved).toBeUndefined();
    });
  });

  describe("Get one by", () => {
    let category1: Category;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      category1 = await categoryRepository.create(TEST_CATEGORIES.category1);
    });

    it("should get a category by id", async () => {
      const categoryRetrieved = await categoryUseCase.getOneBy({
        searchBy: { id: category1.id },
      });
      expect(categoryRetrieved).toBeDefined();
    });
    it("should get a category by name", async () => {
      const categoryRetrieved = await categoryUseCase.getOneBy({
        searchBy: { name: category1.name },
      });
      expect(categoryRetrieved).toBeDefined();
    });
    it("should not get a category by id", async () => {
      const categoryRetrieved = await categoryUseCase.getOneBy({
        searchBy: { id: 123 },
      });
      expect(categoryRetrieved).toBeUndefined();
    });
    it("should not get a category by name", async () => {
      const categoryRetrieved = await categoryUseCase.getOneBy({
        searchBy: { name: "asdasdnmaueygasd" },
      });
      expect(categoryRetrieved).toBeUndefined();
    });
  });

  describe("Get many by", () => {
    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      await Promise.all([
        categoryRepository.create(TEST_CATEGORIES.category1),
        categoryRepository.create(TEST_CATEGORIES.category2),
        categoryRepository.create(TEST_CATEGORIES.category3),
      ]);
    });
    it("should get all categories", async () => {
      const categoriesRetrieved = await categoryUseCase.getManyBy({});
      expect(categoriesRetrieved).toHaveLength(3);
    });
    it("should get all categories with name ele", async () => {
      const categoriesRetrieved = await categoryUseCase.getManyBy({
        searchBy: { name: "ele" },
      });
      expect(categoriesRetrieved).toHaveLength(1);
      expect(categoriesRetrieved.map((c) => c.name)).toContain("electronics");
    });
  });
});
