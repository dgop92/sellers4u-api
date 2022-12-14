import { AppLogger } from "@common/logging/logger";
import { Category } from "@features/product/entities/category";
import { CategoryRepository } from "@features/product/infrastructure/orm/repositories/category.repository";
import { APP_CATEGORIES } from "./app-categories";
import { myCategoryFactory } from "./category.factory";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export async function createAppCategories() {
  const categoryFactory = myCategoryFactory();
  const categoryUseCase = categoryFactory.categoryUseCase;
  const categoryRepository =
    categoryFactory.categoryRepository as CategoryRepository;
  let categories: Category[] = [];
  await categoryRepository.transaction(async (manager) => {
    const promises = APP_CATEGORIES.map((category) =>
      categoryUseCase.getOrCreate({ data: category }, manager)
    );
    myLogger.info("creating app categories");
    categories = await Promise.all(promises);
    myLogger.info("app categories created");
  });
  return categories;
}
