import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { BaseRepository } from "@common/orm/base-repository";
import {
  GenericSelectBuilder,
  getRelationsFromRelationOptions,
  getWhereQueryData,
  SearchType,
} from "@common/orm/generic-query-builder";
import { SLPaginationResult } from "@common/types/common-types";
import { Product } from "@features/product/entities/product";
import {
  ProductCreateRepoData,
  ProductUpdateRepoData,
  IProductRepository,
} from "@features/product/ports/product.repository.definition";
import { ProductSearchInput } from "@features/product/schema-types";
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { ProductEntity } from "../entities/product.orm";
import {
  productEntityFromDomain,
  productEntityToDomain,
} from "../transformers";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class ProductRepository
  extends BaseRepository
  implements IProductRepository
{
  private readonly repository: Repository<ProductEntity>;

  constructor(dataSource: DataSource) {
    super(dataSource);
    this.repository = dataSource.getRepository(ProductEntity);
  }

  async saveProductEntity(
    entityToSave: ProductEntity,
    transactionManager?: EntityManager
  ): Promise<Product> {
    try {
      let productEntity: ProductEntity;
      if (transactionManager) {
        productEntity = await transactionManager.save(entityToSave);
      } else {
        productEntity = await this.repository.save(entityToSave);
      }
      return productEntityToDomain(productEntity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.constraint === "unique_business_code") {
          throw new RepositoryError(
            "product with given code inside this business already exists",
            ErrorCode.DUPLICATED_RECORD,
            { fieldName: "code" }
          );
        }
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  create(input: ProductCreateRepoData): Promise<Product>;
  create<T>(
    input: ProductCreateRepoData,
    transactionManager?: T | undefined
  ): Promise<Product>;
  async create(
    input: ProductCreateRepoData,
    transactionManager?: EntityManager
  ): Promise<Product> {
    myLogger.debug("creating product", { input });
    const productEntity = this.repository.create({
      name: input.name,
      description: input.description,
      price: input.price,
      code: input.code,
      category: { id: input.categoryId },
      business: { id: input.businessId },
    });
    const product = await this.saveProductEntity(
      productEntity,
      transactionManager
    );
    myLogger.debug("product created", { product });
    const { business, category, ...finalProduct } = product;
    return finalProduct;
  }

  update(product: Product, input: ProductUpdateRepoData): Promise<Product>;
  update<T>(
    product: Product,
    input: ProductUpdateRepoData,
    transactionManager?: T | undefined
  ): Promise<Product>;
  async update(
    product: Product,
    input: ProductUpdateRepoData,
    transactionManager?: EntityManager
  ): Promise<Product> {
    myLogger.debug("updating product", { input });
    const productEntity = productEntityFromDomain(product);

    if (input.name) {
      productEntity.name = input.name;
    }

    if (input.description) {
      productEntity.description = input.description;
    }

    if (input.price) {
      productEntity.price = input.price;
    }

    if (input.code) {
      productEntity.code = input.code;
    }

    const productUpdated = await this.saveProductEntity(
      productEntity,
      transactionManager
    );

    myLogger.debug("product updated", { productUpdated });
    return productUpdated;
  }

  delete(product: Product): Promise<void>;
  delete<T>(
    product: Product,
    transactionManager?: T | undefined
  ): Promise<void>;
  async delete(
    product: Product,
    transactionManager?: EntityManager
  ): Promise<void> {
    myLogger.debug("deleting product", { product });
    const productEntity = productEntityFromDomain(product);
    if (transactionManager) {
      await transactionManager.remove(ProductEntity, productEntity);
    } else {
      await this.repository.remove(productEntity);
    }
    myLogger.debug("product deleted", { product });
  }

  getOneBy(input: ProductSearchInput): Promise<Product | undefined>;
  getOneBy<T>(
    input: ProductSearchInput,
    transactionManager?: T | undefined
  ): Promise<Product | undefined>;
  async getOneBy(
    input: ProductSearchInput,
    transactionManager?: EntityManager
  ): Promise<Product | undefined> {
    myLogger.debug("getting product by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(
      input,
      transactionManager
    );
    const productEntity = await genericBuilder.getQuery().getOne();
    myLogger.debug("product was found?: ", { found: !!productEntity });
    return productEntity ? productEntityToDomain(productEntity) : undefined;
  }

  async getManyBy(
    input: ProductSearchInput
  ): Promise<SLPaginationResult<Product>> {
    myLogger.debug("getting products by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(input);
    genericBuilder.addPaginationToQuery(input.pagination);
    const entities = await genericBuilder.getQuery().getMany();
    const entitiesToDomain = entities.map(productEntityToDomain);
    return {
      results: entitiesToDomain,
      count: entitiesToDomain.length,
    };
  }

  private getBaseGenericQueryBuilder(
    input: ProductSearchInput,
    transactionManager?: EntityManager
  ) {
    const query = this.getBaseQuery("record", transactionManager);
    const genericBuilder = new GenericSelectBuilder<ProductEntity>(
      query,
      "record"
    );
    const whereQueryData = getWhereQueryData(input.searchBy, {
      name: {
        searchType: SearchType.LIKE,
        onDecorateValue: (value) => `%${value}%`,
      },
      description: {
        searchType: SearchType.LIKE,
        onDecorateValue: (value) => `%${value}%`,
      },
    });

    if (input.filterBy?.price?.max) {
      whereQueryData.conditions.push("record.price <= :maxPrice");
      whereQueryData.params.maxPrice = input.filterBy.price.max;
    }

    if (input.filterBy?.price?.min) {
      whereQueryData.conditions.push("record.price >= :minPrice");
      whereQueryData.params.minPrice = input.filterBy.price.min;
    }

    const relations = getRelationsFromRelationOptions({
      category: input.options?.fetchCategory,
      business: input.options?.fetchBusiness,
      photos: input.options?.fetchPhotos,
    });
    genericBuilder.addFilterToQuery(whereQueryData);
    genericBuilder.addLeftJoinsToQuery(relations);
    return genericBuilder;
  }

  private getBaseQuery(
    aliasName: string = "record",
    transactionManager?: EntityManager
  ): SelectQueryBuilder<ProductEntity> {
    return (
      transactionManager?.createQueryBuilder(ProductEntity, aliasName) ||
      this.repository.createQueryBuilder(aliasName)
    );
  }
}
