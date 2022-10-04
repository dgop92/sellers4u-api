import {
  businessEntityFromDomain,
  businessEntityToDomain,
} from "@features/business/infrastructure/transformers";
import { Category } from "@features/product/entities/category";
import { Product } from "@features/product/entities/product";
import { ProductPhoto } from "@features/product/entities/product-photo";
import { CategoryEntity } from "./entities/category.orm";
import { ProductPhotoEntity } from "./entities/product-photo.orm";
import { ProductEntity } from "./entities/product.orm";

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

export function productEntityToDomain(productEntity: ProductEntity): Product {
  const product: Product = {
    id: productEntity.id,
    name: productEntity.name,
    description: productEntity.description,
    price: productEntity.price,
    code: productEntity.code,
    createdAt: productEntity.createdAt,
    updatedAt: productEntity.updatedAt,
    deletedAt: productEntity.deletedAt,
  };

  if (productEntity.category) {
    product.category = categoryEntityToDomain(productEntity.category);
  }

  if (productEntity.photos) {
    product.photos = productEntity.photos.map(productPhotoEntityToDomain);
  }

  if (productEntity.business) {
    product.business = businessEntityToDomain(productEntity.business);
  }

  return product;
}

// Note: this transformation removes product photos
export function productEntityFromDomain(product: Product): ProductEntity {
  const productEntity = new ProductEntity();
  productEntity.id = product.id;
  productEntity.name = product.name;
  productEntity.description = product.description;
  productEntity.price = product.price;
  productEntity.code = product.code;
  productEntity.createdAt = product.createdAt;
  productEntity.updatedAt = product.updatedAt;
  productEntity.deletedAt = product.deletedAt;

  if (product.category) {
    productEntity.category = categoryEntityFromDomain(product.category);
  }

  if (product.business) {
    productEntity.business = businessEntityFromDomain(product.business);
  }

  return productEntity;
}
