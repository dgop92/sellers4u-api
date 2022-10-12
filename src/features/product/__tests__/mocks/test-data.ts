import { AppUserEntity } from "@features/auth/infrastructure/orm/entities/app-user.orm";
import { appUserEntityToDomain } from "@features/auth/infrastructure/orm/transformers";
import { BusinessEntity } from "@features/business/infrastructure/orm/entities/business.orm";
import { CategoryEntity } from "@features/product/infrastructure/orm/entities/category.orm";
import { DataSource } from "typeorm";

export const TEST_CATEGORIES = {
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

export const TEST_PRODUCT_PHOTOS = {
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

export const TEST_PRODUCTS = {
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

export async function createTestBusiness(
  datasource: DataSource,
  identifier: number
) {
  const appUserRepository = datasource.getRepository(AppUserEntity);
  const businessRepository = datasource.getRepository(BusinessEntity);
  const appUserEntity = await appUserRepository.save({
    firstName: `test-fr-${identifier}`,
    lastName: `test-lt-${identifier}`,
    firebaseUserId: `G1J2tcEfOFYBycm8ZcXi9tZjN85${identifier}`,
  });
  const business = await businessRepository.save({
    name: `test business ${identifier}`,
    appUser: appUserEntity,
  });
  return business;
}

export async function createTestBusinessWithAppUser(
  datasource: DataSource,
  identifier: number
) {
  const appUserRepository = datasource.getRepository(AppUserEntity);
  const businessRepository = datasource.getRepository(BusinessEntity);
  const appUserEntity = await appUserRepository.save({
    firstName: `test-fr-${identifier}`,
    lastName: `test-lt-${identifier}`,
    firebaseUserId: `G1J2tcEfOFYBycm8ZcXi9tZjN85${identifier}`,
  });
  const business = await businessRepository.save({
    name: `test business ${identifier}`,
    appUser: appUserEntity,
  });
  return { business, appUser: appUserEntityToDomain(appUserEntity) };
}

export async function createTestCategory(
  datasource: DataSource,
  identifier: number
) {
  const categoryRepository = datasource.getRepository(CategoryEntity);
  const category = await categoryRepository.save({
    name: `test category ${identifier}`,
  });
  return category;
}
