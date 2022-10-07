import { AppLogger } from "@common/logging/logger";
import { myCategoryFactory } from "@features/product/factories/category/category.factory";

export const TEST_SERVER_CATEGORIES = {
  category1: {
    name: "food",
    description: "food description",
  },
  category2: {
    name: "electronics",
    description: "electronics description",
  },
  category3: {
    name: "clothes",
    description: "clothes description",
  },
};

export const TEST_SERVER_PRODUCT_PHOTOS = {
  productPhoto1: {
    url: "https://res.cloudinary.com/inevaup/image/upload/v1664759760/baeuhie4ksjgignlq1sx.png",
    imageId: "baeuhie4ksjgignlq1sx",
  },
  productPhoto2: {
    url: "https://res.cloudinary.com/inevaup/image/upload/v1664759760/qcycxuckzasiwfdwcrrc.png",
    imageId: "qcycxuckzasiwfdwcrrc",
  },
  productPhoto3: {
    url: "https://res.cloudinary.com/inevaup/image/upload/v1664759760/hopfmjmxofsyurgytkqs.png",
    imageId: "hopfmjmxofsyurgytkqs",
  },
};

export const TEST_SERVER_PRODUCTS = {
  product1: {
    name: "product1",
    code: "product1-code",
    description: "product1 description",
    price: 100,
  },
  product2: {
    name: "product2",
    code: "product2-code",
    description: "anormal description",
    price: 200,
  },
  product3: {
    name: "diff-3",
    code: "product3-code",
    description: "product3 description",
    price: 500,
  },
};

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export async function setupCategoriesData() {
  const { categoryUseCase } = myCategoryFactory();

  const promises = Object.values(TEST_SERVER_CATEGORIES).map((c) =>
    categoryUseCase.create({
      data: c,
    })
  );
  myLogger.info("setting up categories data");
  const categories = await Promise.all(promises);
  myLogger.info("categories data successfully setup");
  return categories;
}

export async function setupProductModuleData() {
  const categories = await setupCategoriesData();
  return { categories };
}
