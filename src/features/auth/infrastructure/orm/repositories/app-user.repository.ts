import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { BaseRepository } from "@common/orm/base-repository";
import {
  GenericSelectBuilder,
  getWhereQueryData,
} from "@common/orm/generic-query-builder";
import { AppUser } from "@features/auth/entities/app-user";
import { AppUserSearchInput } from "@features/auth/schema-types";
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import {
  AppUserCreateRepoData,
  AppUserUpdateRepoData,
  IAppUserRepository,
} from "../../../ports/app-user.repository.definition";
import { AppUserEntity } from "../entities/app-user.orm";
import {
  appUserEntityFromDomain,
  appUserEntityToDomain,
} from "../transformers";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class AppUserRepository
  extends BaseRepository
  implements IAppUserRepository
{
  private readonly repository: Repository<AppUserEntity>;

  constructor(dataSource: DataSource) {
    super(dataSource);
    this.repository = dataSource.getRepository(AppUserEntity);
  }

  async saveAppUserEntity(
    appUserEntityToSave: AppUserEntity,
    transactionManager?: EntityManager
  ): Promise<AppUser> {
    try {
      let appUserEntity: AppUserEntity;
      if (transactionManager) {
        appUserEntity = await transactionManager.save(appUserEntityToSave);
      } else {
        appUserEntity = await this.repository.save(appUserEntityToSave);
      }
      return appUserEntityToDomain(appUserEntity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.constraint === "unique_firebase_user_id") {
          myLogger.debug("app user already exists");
          throw new RepositoryError(
            "user id is already registered",
            ErrorCode.DUPLICATED_RECORD,
            { fieldName: "userId" }
          );
        }
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  create(input: AppUserCreateRepoData): Promise<AppUser>;
  create<T>(
    input: AppUserCreateRepoData,
    transactionManager?: T | undefined
  ): Promise<AppUser>;
  async create(
    input: AppUserCreateRepoData,
    transactionManager?: EntityManager
  ): Promise<AppUser> {
    myLogger.debug("creating app user", { userId: input.userId });
    const appUserEntity = this.repository.create({
      ...input,
      firebaseUserId: input.userId,
    });
    const appUser = this.saveAppUserEntity(appUserEntity, transactionManager);
    myLogger.debug("app user created", { userId: input.userId });
    return appUser;
  }

  update(appUser: AppUser, input: AppUserUpdateRepoData): Promise<AppUser>;
  update<T>(
    appUser: AppUser,
    input: AppUserUpdateRepoData,
    transactionManager?: T | undefined
  ): Promise<AppUser>;
  async update(
    appUser: AppUser,
    input: AppUserUpdateRepoData,
    transactionManager?: EntityManager
  ): Promise<AppUser> {
    myLogger.debug("updating app user", { id: appUser.id });
    const appUserEntity = appUserEntityFromDomain(appUser);
    if (input.firstName) {
      appUserEntity.firstName = input.firstName;
    }
    if (input.lastName) {
      appUserEntity.lastName = input.lastName;
    }
    const appUserUpdated = await this.saveAppUserEntity(
      appUserEntity,
      transactionManager
    );
    myLogger.debug("app user updated", { id: appUser.id });
    return appUserUpdated;
  }

  delete(appUser: AppUser): Promise<void>;
  delete<T>(
    appUser: AppUser,
    transactionManager?: T | undefined
  ): Promise<void>;
  async delete(
    appUser: AppUser,
    transactionManager?: EntityManager
  ): Promise<void> {
    myLogger.debug("deleting app user", { id: appUser.id });
    const appUserEntity = appUserEntityFromDomain(appUser);
    if (transactionManager) {
      await transactionManager.remove(AppUserEntity, appUserEntity);
    } else {
      await this.repository.remove(appUserEntity);
    }
    myLogger.debug("app user deleted", { id: appUser.id });
  }

  getOneBy(input: AppUserSearchInput): Promise<AppUser | undefined>;
  getOneBy<T>(
    input: AppUserSearchInput,
    transactionManager?: T | undefined
  ): Promise<AppUser | undefined>;
  async getOneBy(
    input: AppUserSearchInput,
    transactionManager?: EntityManager
  ): Promise<AppUser | undefined> {
    myLogger.debug("getting app user by", {
      userId: input.searchBy?.userId,
      id: input.searchBy?.id,
    });
    const query = this.getBaseQuery("record", transactionManager);
    const genericBuilder = new GenericSelectBuilder<AppUserEntity>(
      query,
      "record"
    );
    const whereQueryData = getWhereQueryData(input.searchBy, {
      userId: {
        columnName: "firebaseUserId",
      },
    });
    genericBuilder.addFilterToQuery(whereQueryData);

    const appUserEntity = await genericBuilder.getQuery().getOne();
    return appUserEntity ? appUserEntityToDomain(appUserEntity) : undefined;
  }

  private getBaseQuery(
    aliasName: string = "record",
    transactionManager?: EntityManager
  ): SelectQueryBuilder<AppUserEntity> {
    return (
      transactionManager?.createQueryBuilder(AppUserEntity, aliasName) ||
      this.repository.createQueryBuilder(aliasName)
    );
  }
}
