import { SLPaginationResult } from "@common/types/common-types";
import { AppUser } from "@features/auth/entities/app-user";

import { Business } from "../entities/business";
import {
  BusinessCreateInput,
  BusinessSearchInput,
  BusinessUpdateInput,
} from "../schema-types";

export type BusinessLookUpInput = {
  id: number;
};

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
  delete(input: BusinessLookUpInput, appUser: AppUser): Promise<void>;
  delete(
    input: BusinessLookUpInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<void>;
  getOneBy(input: BusinessSearchInput): Promise<Business | undefined>;
  getOneBy(
    input: BusinessSearchInput,
    transactionManager: any
  ): Promise<Business | undefined>;
  getManyBy(input: BusinessSearchInput): Promise<SLPaginationResult<Business>>;
}
