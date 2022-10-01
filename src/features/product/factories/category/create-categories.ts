import { AppLogger } from "@common/logging/logger";
import { APP_CATEGORIES } from "./app-categories";
import { myCategoryFactory } from "./category.factory";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export async function createAppCategories() {
  const { categoryUseCase, categoryRepository } = myCategoryFactory();
  await categoryRepository.deleteAll();
  const promises = APP_CATEGORIES.map((category) =>
    categoryUseCase.create({ data: category })
  );
  myLogger.info("creating app categories");
  await Promise.all(promises);
  myLogger.info("app categories created");
}
