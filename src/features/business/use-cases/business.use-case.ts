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
import {
  BusinessLookUpInput,
  IBusinessUseCase,
} from "../ports/business.use-case.definition";
import {
  BusinessCreateInput,
  BusinessSearchInput,
  BusinessUpdateInput,
} from "../schema-types";
import { AppUser } from "@features/auth/entities/app-user";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class BusinessUseCase implements IBusinessUseCase {
  constructor(private readonly repository: IBusinessRepository) {}

  create(input: BusinessCreateInput, appUser: AppUser): Promise<Business>;
  create(
    input: BusinessCreateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Business>;
  async create(
    input: BusinessCreateInput,
    transactionManager?: any
  ): Promise<Business> {
    this.validateInput(BusinessCreateInputSchema, input);
    throw new Error("not implemented");
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
    throw new Error("not implemented");
  }

  delete(input: BusinessLookUpInput, appUser: AppUser): Promise<void>;
  delete(
    input: BusinessLookUpInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<void>;
  async delete(
    input: BusinessLookUpInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<void> {
    // this.validateInput(LookUpInputSchema, input);
    throw new Error("not implemented");
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
