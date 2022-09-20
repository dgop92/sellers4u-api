import { Business } from "../entities/business";
import {
  BusinessCreateInput,
  BusinessSearchInput,
  BusinessUpdateInput,
} from "../schema-types";
import { SLPaginationResult } from "@common/types/common-types";
import { AppUser } from "@features/auth/entities/app-user";

export type BusinessCreateRepoData = BusinessCreateInput["data"];
export type BusinessUpdateRepoData = BusinessUpdateInput["data"];

export interface IBusinessRepository {
  create(input: BusinessCreateRepoData, appUser: AppUser): Promise<Business>;
  create<T>(
    input: BusinessCreateRepoData,
    appUser: AppUser,
    transactionManager?: T
  ): Promise<Business>;
  update(business: Business, input: BusinessUpdateRepoData): Promise<Business>;
  update<T>(
    business: Business,
    input: BusinessUpdateRepoData,
    transactionManager?: T
  ): Promise<Business>;
  delete(business: Business): Promise<void>;
  delete<T>(business: Business, transactionManager?: T): Promise<void>;
  getOneBy(input: BusinessSearchInput): Promise<Business | undefined>;
  getOneBy<T>(
    input: BusinessSearchInput,
    transactionManager?: T
  ): Promise<Business | undefined>;
  getManyBy(input: BusinessSearchInput): Promise<SLPaginationResult<Business>>;
}
