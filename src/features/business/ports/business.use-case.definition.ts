import { SLPaginationResult } from "@common/types/common-types";
import { AppUser } from "@features/auth/entities/app-user";

import { Business } from "../entities/business";
import {
  BusinessCreateInput,
  BusinessSearchInput,
  BusinessUpdateInput,
} from "../schema-types";

export interface IBusinessUseCase {
  create(input: BusinessCreateInput, appUser: AppUser): Promise<Business>;
  create(
    input: BusinessCreateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Business>;
  update(input: BusinessUpdateInput, appUser: AppUser): Promise<Business>;
  update(
    input: BusinessUpdateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<Business>;
  delete(appUser: AppUser): Promise<void>;
  delete(appUser: AppUser, transactionManager: any): Promise<void>;
  getOneBy(input: BusinessSearchInput): Promise<Business | undefined>;
  getOneBy(
    input: BusinessSearchInput,
    transactionManager: any
  ): Promise<Business | undefined>;
  getManyBy(input: BusinessSearchInput): Promise<SLPaginationResult<Business>>;
  getAppUserBusiness(appUser: AppUser): Promise<Business | undefined>;
  getAppUserBusiness(
    appUser: AppUser,
    transactionManager: any
  ): Promise<Business | undefined>;
}
