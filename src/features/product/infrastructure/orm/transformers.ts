import { Category } from "@features/product/entities/category";
import { ProductPhoto } from "@features/product/entities/product-photo";
import { CategoryEntity } from "./entities/category.orm";
import { ProductPhotoEntity } from "./entities/product-photo.orm";

export function categoryEntityToDomain(
  categoryEntity: CategoryEntity
): Category {
  return {
    id: categoryEntity.id,
    name: categoryEntity.name,
    description: categoryEntity.description,
    createdAt: categoryEntity.createdAt,
    updatedAt: categoryEntity.updatedAt,
    deletedAt: categoryEntity.deletedAt,
  };
}

export function categoryEntityFromDomain(category: Category): CategoryEntity {
  const categoryEntity = new CategoryEntity();
  categoryEntity.id = category.id;
  categoryEntity.name = category.name;
  categoryEntity.description = category.description;
  categoryEntity.createdAt = category.createdAt;
  categoryEntity.updatedAt = category.updatedAt;
  categoryEntity.deletedAt = category.deletedAt;
  return categoryEntity;
}

export function productPhotoEntityToDomain(
  productPhotoEntity: ProductPhotoEntity
): ProductPhoto {
  return {
    imageId: productPhotoEntity.imageId,
    url: productPhotoEntity.url,
    createdAt: productPhotoEntity.createdAt,
    updatedAt: productPhotoEntity.updatedAt,
    deletedAt: productPhotoEntity.deletedAt,
  };
}
