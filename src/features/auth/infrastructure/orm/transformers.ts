import { AppUser } from "@features/auth/entities/app-user";
import { User } from "@features/auth/entities/user";
import { AppUserEntity } from "./entities/app-user.orm";

export function appUserEntityToDomain(
  entity: AppUserEntity,
  user?: User
): AppUser {
  return {
    id: entity.id,
    firstName: entity.firstName,
    lastName: entity.lastName,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    user,
  };
}

export function appUserEntityFromDomain(appUser: AppUser): AppUserEntity {
  const appUserEntity = new AppUserEntity();
  appUserEntity.id = appUser.id;
  appUserEntity.firstName = appUser.firstName;
  appUserEntity.lastName = appUser.firstName;
  appUserEntity.createdAt = appUser.createdAt;
  appUserEntity.updatedAt = appUser.updatedAt;
  appUserEntity.deletedAt = appUser.deletedAt;
  if (appUser.user) {
    appUserEntity.firebaseUserId = appUser.user.id;
  }
  return appUserEntity;
}
