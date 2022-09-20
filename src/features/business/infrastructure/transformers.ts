import {
  appUserEntityFromDomain,
  appUserEntityToDomain,
} from "@features/auth/infrastructure/orm/transformers";
import { Business } from "../entities/business";
import { BusinessEntity } from "./orm/entities/business.orm";

export function businessEntityToDomain(entity: BusinessEntity): Business {
  const business: Business = {
    id: entity.id,
    name: entity.name,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
  };
  if (entity.appUser) {
    business.owner = appUserEntityToDomain(entity.appUser);
  }
  return business;
}

export function businessEntityFromDomain(business: Business): BusinessEntity {
  const businessEntity = new BusinessEntity();
  businessEntity.id = business.id;
  businessEntity.name = business.name;
  businessEntity.createdAt = business.createdAt;
  businessEntity.updatedAt = business.updatedAt;
  businessEntity.deletedAt = business.deletedAt;
  if (business.owner) {
    businessEntity.appUser = appUserEntityFromDomain(business.owner);
  }
  return businessEntity;
}
