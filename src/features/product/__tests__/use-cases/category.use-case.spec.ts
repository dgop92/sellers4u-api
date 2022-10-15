import { InvalidInputError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { Category } from "@features/product/entities/category";
import { myCategoryFactory } from "@features/product/factories/category/category.factory";
import { ICategoryRepository } from "@features/product/ports/category.repository.definition";
import { ICategoryUseCase } from "@features/product/ports/category.use-case.definition";
import { CategoryUseCase } from "@features/product/use-cases/category.use-case";
import { TestDBHelper } from "test/test-db-helper";
import { TEST_CATEGORIES } from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("category use-case", () => {
  let categoryRepository: ICategoryRepository;
  let categoryUseCase: ICategoryUseCase;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const ds = TestDBHelper.instance.datasource;
    const categoryFactory = myCategoryFactory(ds);
    categoryRepository = categoryFactory.categoryRepository;
    categoryUseCase = categoryFactory.categoryUseCase;
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

    beforeAll(async () => {
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
    beforeAll(async () => {
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

describe("category use-case invalid input", () => {
  let categoryUseCase: ICategoryUseCase;

  beforeAll(async () => {
    categoryUseCase = new CategoryUseCase(undefined!);
  });

  describe("Create Invalid Input", () => {
    it("should throw an error if name has more than 100 characters", async () => {
      try {
        await categoryUseCase.create({
          data: { name: Array(130).join("x") },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });

    it("should throw an error if name has less than 2 characters", async () => {
      try {
        await categoryUseCase.create({ data: { name: Array(1).join("x") } });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });

    it("should throw an error if description has more than 1000 characters", async () => {
      try {
        await categoryUseCase.create({
          data: { description: Array(1050).join("x"), name: "aaaaaaa" },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("description");
        }
      }
    });
  });

  describe("Update Invalid Input", () => {
    it("should throw an error if name has more than 100 characters", async () => {
      try {
        await categoryUseCase.update({
          data: { name: Array(130).join("x") },
          searchBy: { id: 1 },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });

    it("should throw an error if name has less than 2 characters", async () => {
      try {
        await categoryUseCase.update({
          data: { name: Array(1).join("x") },
          searchBy: { id: 1 },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });

    it("should throw an error if description has more than 1000 characters", async () => {
      try {
        await categoryUseCase.update({
          data: { description: Array(1050).join("x"), name: "aaaaaaa" },
          searchBy: { id: 1 },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("description");
        }
      }
    });
  });
});
