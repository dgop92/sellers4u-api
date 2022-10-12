import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import { SLPaginationResult } from "@common/types/common-types";
import {
  Product,
  ProductCreateInputSchema,
  ProductSearchInputSchema,
  ProductUpdateInputSchema,
} from "../entities/product";
import { IProductRepository } from "../ports/product.repository.definition";
import {
  ProductLookUpInput,
  IProductUseCase,
} from "../ports/product.use-case.definition";
import {
  ProductCreateInput,
  ProductSearchInput,
  ProductUpdateInput,
} from "../schema-types";
import { ApplicationError, ErrorCode } from "@common/errors";
import { AppUser } from "@features/auth/entities/app-user";
import { IBusinessUseCase } from "@features/business/ports/business.use-case.definition";
import { IntegerLookUpInputSchema } from "@common/schemas/idValidations";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class ProductUseCase implements IProductUseCase {
  constructor(
    private readonly repository: IProductRepository,
    private readonly businessUseCase: IBusinessUseCase
  ) {}

  private async checkIfAppUserIsOwnerOfBusiness(
    appUser: AppUser,
    businessId: number,
    transactionManager?: any
  ) {
    const business = await this.businessUseCase.getAppUserBusiness(
      appUser,
      transactionManager
    );

    if (!business) {
      throw new ApplicationError("business not found", ErrorCode.NOT_FOUND);
    }

    if (business.id !== businessId) {
      throw new ApplicationError(
        "cannot create product for a business that is not owned by this app user",
        ErrorCode.FORBIDDEN
      );
    }
  }

  create(input: ProductCreateInput, appUser: AppUser): Promise<Product>;
  create(
    input: ProductCreateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Product>;
  async create(
    input: ProductCreateInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<Product> {
    this.validateInput(ProductCreateInputSchema, input);

    await this.checkIfAppUserIsOwnerOfBusiness(
      appUser,
      input.data.businessId,
      transactionManager
    );

    return this.repository.create(input.data, transactionManager);
  }

  update(input: ProductUpdateInput, appUser: AppUser): Promise<Product>;
  update(
    input: ProductUpdateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Product>;
  async update(
    input: ProductUpdateInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<Product> {
    this.validateInput(ProductUpdateInputSchema, input);

    const business = await this.businessUseCase.getAppUserBusiness(
      appUser,
      transactionManager
    );

    // NOTE: this may be a integrity error, how is possible that the product
    // exists but the business does not?
    if (!business) {
      throw new ApplicationError("business not found", ErrorCode.NOT_FOUND);
    }

    myLogger.debug("getting product by", { id: input.searchBy.id });
    const product = await this.repository.getOneBy(
      {
        searchBy: { id: input.searchBy.id, businessId: business.id },
        options: { fetchBusiness: true },
      },
      transactionManager
    );

    if (!product) {
      throw new ApplicationError("product not found", ErrorCode.NOT_FOUND);
    }
    myLogger.debug("product found", { id: input.searchBy.id });

    return this.repository.update(product, input.data, transactionManager);
  }

  delete(input: ProductLookUpInput, appUser: AppUser): Promise<void>;
  delete(
    input: ProductLookUpInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<void>;
  async delete(
    input: ProductLookUpInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<void> {
    this.validateInput(IntegerLookUpInputSchema, input);
    const business = await this.businessUseCase.getAppUserBusiness(
      appUser,
      transactionManager
    );

    // NOTE: this may be a integrity error, how is possible that the product
    // exists but the business does not?
    if (!business) {
      throw new ApplicationError("business not found", ErrorCode.NOT_FOUND);
    }

    myLogger.debug("getting product by", { id: input.id });
    const product = await this.repository.getOneBy(
      {
        searchBy: { id: input.id, businessId: business.id },
        options: { fetchBusiness: true },
      },
      transactionManager
    );

    if (!product) {
      throw new ApplicationError("product not found", ErrorCode.NOT_FOUND);
    }
    myLogger.debug("product found", { id: input.id });

    return this.repository.delete(product, transactionManager);
  }

  getOneBy(input: ProductSearchInput): Promise<Product | undefined>;
  getOneBy(
    input: ProductSearchInput,
    transactionManager: any
  ): Promise<Product | undefined>;
  getOneBy(
    input: ProductSearchInput,
    transactionManager?: any
  ): Promise<Product | undefined> {
    this.validateInput(ProductSearchInputSchema, input);
    return this.repository.getOneBy(input, transactionManager);
  }

  getManyBy(input: ProductSearchInput): Promise<SLPaginationResult<Product>> {
    this.validateInput(ProductSearchInputSchema, input);
    return this.repository.getManyBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
