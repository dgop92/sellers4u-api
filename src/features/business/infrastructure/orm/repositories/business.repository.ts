import { AppLogger } from "@common/logging/logger";
import { BaseRepository } from "@common/orm/base-repository";
import {
  GenericSelectBuilder,
  getRelationsFromRelationOptions,
  getWhereQueryData,
  SearchType,
} from "@common/orm/generic-query-builder";
import { SLPaginationResult } from "@common/types/common-types";
import { AppUser } from "@features/auth/entities/app-user";
import { appUserEntityFromDomain } from "@features/auth/infrastructure/orm/transformers";
import { Business } from "@features/business/entities/business";
import {
  BusinessCreateRepoData,
  BusinessUpdateRepoData,
  IBusinessRepository,
} from "@features/business/ports/business.repository.definition";
import { BusinessSearchInput } from "@features/business/schema-types";
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import {
  businessEntityFromDomain,
  businessEntityToDomain,
} from "../../transformers";
import { BusinessEntity } from "../entities/business.orm";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class BusinessRepository
  extends BaseRepository
  implements IBusinessRepository
{
  private readonly repository: Repository<BusinessEntity>;

  constructor(dataSource: DataSource) {
    super(dataSource);
    this.repository = dataSource.getRepository(BusinessEntity);
  }

  async saveBusinessEntity(
    businessEntityToSave: BusinessEntity,
    transactionManager?: EntityManager
  ): Promise<Business> {
    let businessEntity: BusinessEntity;
    if (transactionManager) {
      businessEntity = await transactionManager.save(businessEntityToSave);
    } else {
      businessEntity = await this.repository.save(businessEntityToSave);
    }
    return businessEntityToDomain(businessEntity);
  }

  create(input: BusinessCreateRepoData, appUser: AppUser): Promise<Business>;
  create<T>(
    input: BusinessCreateRepoData,
    appUser: AppUser,
    transactionManager?: T | undefined
  ): Promise<Business>;
  async create(
    input: BusinessCreateRepoData,
    appUser: AppUser,
    transactionManager?: EntityManager
  ): Promise<Business> {
    myLogger.debug("creating business", {
      input,
      appUserId: appUser.id,
    });
    const appUserEntity = appUserEntityFromDomain(appUser);

    const businessEntity = new BusinessEntity();
    businessEntity.name = input.name;
    businessEntity.appUser = appUserEntity;
    if (input.shortDescription) {
      businessEntity.shortDescription = input.shortDescription;
    }
    if (input.description) {
      businessEntity.description = input.description;
    }

    const business = await this.saveBusinessEntity(
      businessEntity,
      transactionManager
    );
    myLogger.debug("business created", {
      businessId: business.id,
    });
    return business;
  }

  update(business: Business, input: BusinessUpdateRepoData): Promise<Business>;
  update<T>(
    business: Business,
    input: BusinessUpdateRepoData,
    transactionManager?: T | undefined
  ): Promise<Business>;
  async update(
    business: Business,
    input: BusinessCreateRepoData,
    transactionManager?: EntityManager
  ): Promise<Business> {
    myLogger.debug("updating business", {
      businessId: business.id,
      input,
    });
    const businessEntity = businessEntityFromDomain(business);

    if (input.name) {
      businessEntity.name = input.name;
    }

    if (input.shortDescription) {
      businessEntity.shortDescription = input.shortDescription;
    }

    if (input.description) {
      businessEntity.description = input.description;
    }

    const businessUpdated = await this.saveBusinessEntity(
      businessEntity,
      transactionManager
    );
    myLogger.debug("business updated", {
      businessId: businessUpdated.id,
    });
    return businessUpdated;
  }

  delete(business: Business): Promise<void>;
  delete<T>(
    business: Business,
    transactionManager?: T | undefined
  ): Promise<void>;
  async delete(
    business: Business,
    transactionManager?: EntityManager
  ): Promise<void> {
    myLogger.debug("deleting business", { businessId: business.id });
    const businessEntity = businessEntityFromDomain(business);
    if (transactionManager) {
      await transactionManager.remove(BusinessEntity, businessEntity);
    } else {
      await this.repository.remove(businessEntity);
    }
    myLogger.debug("business deleted", { businessId: business.id });
  }

  getOneBy(input: BusinessSearchInput): Promise<Business | undefined>;
  getOneBy<T>(
    input: BusinessSearchInput,
    transactionManager?: T | undefined
  ): Promise<Business | undefined>;
  async getOneBy(
    input: BusinessSearchInput,
    transactionManager?: EntityManager
  ): Promise<Business | undefined> {
    myLogger.debug("getting business by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(
      input,
      transactionManager
    );
    const businessEntity = await genericBuilder.getQuery().getOne();
    myLogger.debug("business was found? ", { found: !!businessEntity });
    return businessEntity ? businessEntityToDomain(businessEntity) : undefined;
  }

  async getManyBy(
    input: BusinessSearchInput
  ): Promise<SLPaginationResult<Business>> {
    myLogger.debug("getting businesss by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(input);
    genericBuilder.addPaginationToQuery(input.pagination);
    const entities = await genericBuilder.getQuery().getMany();
    const entitiesToDomain = entities.map(businessEntityToDomain);
    return {
      results: entitiesToDomain,
      count: entitiesToDomain.length,
    };
  }

  private getBaseGenericQueryBuilder(
    input: BusinessSearchInput,
    transactionManager?: EntityManager
  ) {
    const query = this.getBaseQuery("record", transactionManager);
    const genericBuilder = new GenericSelectBuilder<BusinessEntity>(
      query,
      "record"
    );

    const relations = getRelationsFromRelationOptions({
      appUser: input.options?.fetchOwner,
    });
    const whereQueryData = getWhereQueryData(input.searchBy, {
      name: {
        searchType: SearchType.LIKE,
        onDecorateValue: (value) => `%${value}%`,
      },
    });

    genericBuilder
      .addLeftJoinsToQuery(relations)
      .addFilterToQuery(whereQueryData);
    return genericBuilder;
  }

  private getBaseQuery(
    aliasName: string = "record",
    transactionManager?: EntityManager
  ): SelectQueryBuilder<BusinessEntity> {
    return (
      transactionManager?.createQueryBuilder(BusinessEntity, aliasName) ||
      this.repository.createQueryBuilder(aliasName)
    );
  }
}
