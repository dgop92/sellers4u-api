import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { BaseRepository } from "@common/orm/base-repository";
import {
  GenericSelectBuilder,
  getWhereQueryData,
} from "@common/orm/generic-query-builder";
import { ProductPhoto } from "@features/product/entities/product-photo";
import {
  ProductPhotoCreateRepoData,
  IProductPhotoRepository,
} from "@features/product/ports/product-photo/product-photo.repository.definition";
import { ProductPhotoSearchInput } from "@features/product/schema-types";
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { ProductPhotoEntity } from "../entities/product-photo.orm";
import { productPhotoEntityToDomain } from "../transformers";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class ProductPhotoRepository
  extends BaseRepository
  implements IProductPhotoRepository
{
  private readonly repository: Repository<ProductPhotoEntity>;

  constructor(dataSource: DataSource) {
    super(dataSource);
    this.repository = dataSource.getRepository(ProductPhotoEntity);
  }

  create(input: ProductPhotoCreateRepoData): Promise<ProductPhoto>;
  create<T>(
    input: ProductPhotoCreateRepoData,
    transactionManager?: T | undefined
  ): Promise<ProductPhoto>;
  async create(
    input: ProductPhotoCreateRepoData,
    transactionManager?: EntityManager
  ): Promise<ProductPhoto> {
    try {
      myLogger.debug("saving product photo in db", {
        productId: input.productId,
        imageId: input.imageId,
      });
      const productPhotoEntity = this.repository.create({
        product: { id: input.productId },
        imageId: input.imageId,
        url: input.url,
      });
      let productPhotoEntitySaved: ProductPhotoEntity;
      if (transactionManager) {
        productPhotoEntitySaved = await transactionManager.save(
          productPhotoEntity
        );
      } else {
        productPhotoEntitySaved = await this.repository.save(
          productPhotoEntity
        );
      }
      myLogger.debug("saved product photo in db", {
        productId: input.productId,
        imageId: input.imageId,
      });
      return productPhotoEntityToDomain(productPhotoEntitySaved);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.constraint === "unique_image_id") {
          throw new RepositoryError(
            "product with given imageId already exists",
            ErrorCode.DUPLICATED_RECORD,
            { fieldName: "imageId" }
          );
        }
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  delete(productPhoto: ProductPhoto): Promise<void>;
  delete<T>(
    productPhoto: ProductPhoto,
    transactionManager?: T | undefined
  ): Promise<void>;
  async delete(
    productPhoto: ProductPhoto,
    transactionManager?: EntityManager
  ): Promise<void> {
    myLogger.debug("deleting product photo in db");
    if (transactionManager) {
      await transactionManager
        .createQueryBuilder()
        .delete()
        .from(ProductPhotoEntity)
        .where("imageId = :imageId", {
          imageId: productPhoto.imageId,
        })
        .execute();
    } else {
      await this.repository
        .createQueryBuilder()
        .delete()
        .where("imageId = :imageId", {
          imageId: productPhoto.imageId,
        })
        .execute();
    }
    myLogger.debug("deleted product photo in db");
  }

  getOneBy(input: ProductPhotoSearchInput): Promise<ProductPhoto | undefined>;
  getOneBy<T>(
    input: ProductPhotoSearchInput,
    transactionManager?: T | undefined
  ): Promise<ProductPhoto | undefined>;
  async getOneBy(
    input: ProductPhotoSearchInput,
    transactionManager?: EntityManager
  ): Promise<ProductPhoto | undefined> {
    myLogger.debug("getting product photo by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(
      input,
      transactionManager
    );
    const productPhotoEntity = await genericBuilder.getQuery().getOne();
    myLogger.debug("product photo was found?: ", {
      found: !!productPhotoEntity,
    });
    return productPhotoEntity
      ? productPhotoEntityToDomain(productPhotoEntity)
      : undefined;
  }

  async getManyBy(input: ProductPhotoSearchInput): Promise<ProductPhoto[]> {
    myLogger.debug("getting product photos by", { input });
    const genericBuilder = this.getBaseGenericQueryBuilder(input);
    const entities = await genericBuilder.getQuery().getMany();
    const entitiesToDomain = entities.map(productPhotoEntityToDomain);
    return entitiesToDomain;
  }

  private getBaseGenericQueryBuilder(
    input: ProductPhotoSearchInput,
    transactionManager?: EntityManager
  ) {
    const query = this.getBaseQuery("record", transactionManager);
    const genericBuilder = new GenericSelectBuilder<ProductPhotoEntity>(
      query,
      "record"
    );

    const whereQueryData = getWhereQueryData(input.searchBy);

    genericBuilder.addFilterToQuery(whereQueryData);
    return genericBuilder;
  }

  private getBaseQuery(
    aliasName: string = "record",
    transactionManager?: EntityManager
  ): SelectQueryBuilder<ProductPhotoEntity> {
    return (
      transactionManager?.createQueryBuilder(ProductPhotoEntity, aliasName) ||
      this.repository.createQueryBuilder(aliasName)
    );
  }
}
