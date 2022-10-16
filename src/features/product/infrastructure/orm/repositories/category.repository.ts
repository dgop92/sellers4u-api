import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { BaseRepository } from "@common/orm/base-repository";
import {
  GenericSelectBuilder,
  getWhereQueryData,
  SearchType,
} from "@common/orm/generic-query-builder";
import { Category } from "@features/product/entities/category";
import {
  CategoryCreateRepoData,
  CategoryUpdateRepoData,
  ICategoryRepository,
} from "@features/product/ports/category.repository.definition";
import { CategorySearchInput } from "@features/product/schema-types";
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { CategoryEntity } from "../entities/category.orm";
import {
  categoryEntityFromDomain,
  categoryEntityToDomain,
} from "../transformers";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class CategoryRepository
  extends BaseRepository
  implements ICategoryRepository
{
  private readonly repository: Repository<CategoryEntity>;

  constructor(dataSource: DataSource) {
    super(dataSource);
    this.repository = dataSource.getRepository(CategoryEntity);
  }

  async saveCategoryEntity(
    categoryEntityToSave: CategoryEntity,
    transactionManager?: EntityManager
  ): Promise<Category> {
    try {
      let categoryEntity: CategoryEntity;
      if (transactionManager) {
        categoryEntity = await transactionManager.save(categoryEntityToSave);
      } else {
        categoryEntity = await this.repository.save(categoryEntityToSave);
      }
      return categoryEntityToDomain(categoryEntity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.constraint === "unique_category_name") {
          throw new RepositoryError(
            "category with given name already exists",
            ErrorCode.DUPLICATED_RECORD,
            { fieldName: "name" }
          );
        }
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  create(input: CategoryCreateRepoData): Promise<Category>;
  create<T>(
    input: CategoryCreateRepoData,
    transactionManager?: T | undefined
  ): Promise<Category>;
  async create(
    input: CategoryCreateRepoData,
    transactionManager?: EntityManager
  ): Promise<Category> {
    myLogger.debug("creating category", {
      name: input.name,
    });
    const categoryEntity = new CategoryEntity();
    categoryEntity.name = input.name;
    if (input.description) {
      categoryEntity.description = input.description;
    }
    const category = await this.saveCategoryEntity(
      categoryEntity,
      transactionManager
    );
    myLogger.debug("category created", {
      name: input.name,
      id: category.id,
    });
    return category;
  }

  update(category: Category, input: CategoryUpdateRepoData): Promise<Category>;
  update<T>(
    category: Category,
    input: CategoryUpdateRepoData,
    transactionManager?: T | undefined
  ): Promise<Category>;
  async update(
    category: Category,
    input: CategoryCreateRepoData,
    transactionManager?: EntityManager
  ): Promise<Category> {
    myLogger.debug("updating category", {
      id: category.id,
    });
    const categoryEntity = categoryEntityFromDomain(category);

    if (input.name) {
      categoryEntity.name = input.name;
    }

    if (input.description) {
      categoryEntity.description = input.description;
    }

    const updatedCategory = await this.saveCategoryEntity(
      categoryEntity,
      transactionManager
    );
    myLogger.debug("category updated", {
      id: category.id,
    });
    return updatedCategory;
  }

  delete(category: Category): Promise<void>;
  delete<T>(
    category: Category,
    transactionManager?: T | undefined
  ): Promise<void>;
  async delete(
    category: Category,
    transactionManager?: EntityManager
  ): Promise<void> {
    myLogger.debug("deleting category", {
      id: category.id,
    });
    const categoryEntity = categoryEntityFromDomain(category);
    if (transactionManager) {
      await transactionManager.remove(CategoryEntity, categoryEntity);
    } else {
      await this.repository.remove(categoryEntity);
    }
    myLogger.debug("category deleted", {
      id: category.id,
    });
  }

  async deleteAll(): Promise<void> {
    const tableName = this.repository.metadata.tableName;
    myLogger.debug("deleting all categories", { tableName });
    await this.repository.query(`DELETE FROM ${tableName}`);
    myLogger.debug("all categories deleted");
  }

  getOneBy(input: CategorySearchInput): Promise<Category | undefined>;
  getOneBy<T>(
    input: CategorySearchInput,
    transactionManager?: T | undefined
  ): Promise<Category | undefined>;
  async getOneBy(
    input: CategorySearchInput,
    transactionManager?: EntityManager
  ): Promise<Category | undefined> {
    myLogger.debug("getting category by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(
      input,
      transactionManager
    );
    const categoryEntity = await genericBuilder.getQuery().getOne();
    myLogger.debug("category was found?: ", { found: !!categoryEntity });
    return categoryEntity ? categoryEntityToDomain(categoryEntity) : undefined;
  }

  async getManyBy(input: CategorySearchInput): Promise<Category[]> {
    myLogger.debug("getting categories by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(input);
    const entities = await genericBuilder.getQuery().getMany();
    const entitiesToDomain = entities.map(categoryEntityToDomain);
    return entitiesToDomain;
  }

  private getBaseGenericQueryBuilder(
    input: CategorySearchInput,
    transactionManager?: EntityManager
  ) {
    const query = this.getBaseQuery("record", transactionManager);
    const genericBuilder = new GenericSelectBuilder<CategoryEntity>(
      query,
      "record"
    );

    const whereQueryData = getWhereQueryData(input.searchBy, {
      name: {
        searchType: SearchType.LIKE,
        onDecorateValue: (value) => `%${value}%`,
      },
    });

    genericBuilder.addFilterToQuery(whereQueryData);
    return genericBuilder;
  }

  private getBaseQuery(
    aliasName: string = "record",
    transactionManager?: EntityManager
  ): SelectQueryBuilder<CategoryEntity> {
    return (
      transactionManager?.createQueryBuilder(CategoryEntity, aliasName) ||
      this.repository.createQueryBuilder(aliasName)
    );
  }
}
