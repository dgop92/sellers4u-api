import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import { SLPaginationResult } from "@common/types/common-types";
import {
  Business,
  BusinessCreateInputSchema,
  BusinessSearchInputSchema,
  BusinessUpdateInputSchema,
} from "../entities/business";
import { IBusinessRepository } from "../ports/business.repository.definition";
import { IBusinessUseCase } from "../ports/business.use-case.definition";
import {
  BusinessCreateInput,
  BusinessSearchInput,
  BusinessUpdateInput,
} from "../schema-types";
import { AppUser } from "@features/auth/entities/app-user";
import { ApplicationError, ErrorCode } from "@common/errors";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class BusinessUseCase implements IBusinessUseCase {
  constructor(private readonly repository: IBusinessRepository) {}

  getAppUserBusiness(appUser: AppUser): Promise<Business | undefined>;
  getAppUserBusiness(
    appUser: AppUser,
    transactionManager: any
  ): Promise<Business | undefined>;
  getAppUserBusiness(
    appUser: AppUser,
    transactionManager?: unknown
  ): Promise<Business | undefined> {
    myLogger.debug("getting business of app user", { appUserId: appUser.id });
    return this.repository.getOneBy(
      {
        searchBy: { appUserId: appUser.id },
        options: { fetchOwner: false },
      },
      transactionManager
    );
  }

  create(input: BusinessCreateInput, appUser: AppUser): Promise<Business>;
  create(
    input: BusinessCreateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Business>;
  async create(
    input: BusinessCreateInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<Business> {
    this.validateInput(BusinessCreateInputSchema, input);

    // If app user already have a business then throw error
    const business = await this.getAppUserBusiness(appUser, transactionManager);
    if (business) {
      throw new ApplicationError(
        "app user already have a business",
        ErrorCode.DUPLICATED_RECORD,
        { fieldName: "business" }
      );
    }

    return this.repository.create(input.data, appUser, transactionManager);
  }

  update(input: BusinessUpdateInput, appUser: AppUser): Promise<Business>;
  update(
    input: BusinessUpdateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Business>;
  async update(
    input: BusinessUpdateInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<Business> {
    this.validateInput(BusinessUpdateInputSchema, input);

    const business = await this.getAppUserBusiness(appUser, transactionManager);
    if (!business) {
      throw new ApplicationError("business not found", ErrorCode.NOT_FOUND);
    }

    return this.repository.update(business, input.data, transactionManager);
  }

  delete(appUser: AppUser): Promise<void>;
  delete(appUser: AppUser, transactionManager: any): Promise<void>;
  async delete(appUser: AppUser, transactionManager?: any): Promise<void> {
    const business = await this.getAppUserBusiness(appUser, transactionManager);
    if (!business) {
      throw new ApplicationError("business not found", ErrorCode.NOT_FOUND);
    }
    await this.repository.delete(business, transactionManager);
  }

  getOneBy(input: BusinessSearchInput): Promise<Business | undefined>;
  getOneBy(
    input: BusinessSearchInput,
    transactionManager: any
  ): Promise<Business | undefined>;
  getOneBy(
    input: BusinessSearchInput,
    transactionManager?: any
  ): Promise<Business | undefined> {
    this.validateInput(BusinessSearchInputSchema, input);
    return this.repository.getOneBy(input, transactionManager);
  }

  getManyBy(input: BusinessSearchInput): Promise<SLPaginationResult<Business>> {
    this.validateInput(BusinessSearchInputSchema, input);
    return this.repository.getManyBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
