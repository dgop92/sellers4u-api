import { Category } from "../entities/category";
import {
  CategoryCreateInput,
  CategorySearchInput,
  CategoryUpdateInput,
} from "../schema-types";

export type CategoryLookUpInput = {
  id: number;
};

export interface ICategoryUseCase {
  create(input: CategoryCreateInput): Promise<Category>;
  create(
    input: CategoryCreateInput,
    transactionManager: any
  ): Promise<Category>;
  update(input: CategoryUpdateInput): Promise<Category>;
  update(
    input: CategoryUpdateInput,
    transactionManager: any
  ): Promise<Category>;
  delete(input: CategoryLookUpInput): Promise<void>;
  delete(input: CategoryLookUpInput, transactionManager: any): Promise<void>;
  getOneBy(input: CategorySearchInput): Promise<Category | undefined>;
  getOneBy(
    input: CategorySearchInput,
    transactionManager: any
  ): Promise<Category | undefined>;
  getManyBy(input: CategorySearchInput): Promise<Category[]>;
}
