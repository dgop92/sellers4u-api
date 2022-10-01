import { Category } from "../entities/category";
import {
  CategoryCreateInput,
  CategorySearchInput,
  CategoryUpdateInput,
} from "../schema-types";

export type CategoryCreateRepoData = CategoryCreateInput["data"];
export type CategoryUpdateRepoData = CategoryUpdateInput["data"];

export interface ICategoryRepository {
  create(input: CategoryCreateRepoData): Promise<Category>;
  create<T>(
    input: CategoryCreateRepoData,
    transactionManager?: T
  ): Promise<Category>;
  update(category: Category, input: CategoryUpdateRepoData): Promise<Category>;
  update<T>(
    category: Category,
    input: CategoryUpdateRepoData,
    transactionManager?: T
  ): Promise<Category>;
  delete(category: Category): Promise<void>;
  delete<T>(category: Category, transactionManager?: T): Promise<void>;
  deleteAll(): Promise<void>;
  getOneBy(input: CategorySearchInput): Promise<Category | undefined>;
  getOneBy<T>(
    input: CategorySearchInput,
    transactionManager?: T
  ): Promise<Category | undefined>;
  getManyBy(input: CategorySearchInput): Promise<Category[]>;
}
