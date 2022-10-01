import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import {
  Category,
  CategoryCreateInputSchema,
  CategorySearchInputSchema,
  CategoryUpdateInputSchema,
} from "../entities/category";
import { ICategoryRepository } from "../ports/category.repository.definition";
import {
  CategoryLookUpInput,
  ICategoryUseCase,
} from "../ports/category.use-case.definition";
import {
  CategoryCreateInput,
  CategorySearchInput,
  CategoryUpdateInput,
} from "../schema-types";
import { ApplicationError, ErrorCode } from "@common/errors";
import { IntegerLookUpInputSchema } from "@common/schemas/idValidations";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class CategoryUseCase implements ICategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  create(input: CategoryCreateInput): Promise<Category>;
  create(
    input: CategoryCreateInput,
    transactionManager: any
  ): Promise<Category>;
  create(
    input: CategoryCreateInput,
    transactionManager?: any
  ): Promise<Category> {
    this.validateInput(CategoryCreateInputSchema, input);
    return this.repository.create(input.data, transactionManager);
  }

  update(input: CategoryUpdateInput): Promise<Category>;
  update(
    input: CategoryUpdateInput,
    transactionManager: any
  ): Promise<Category>;
  async update(
    input: CategoryUpdateInput,
    transactionManager?: any
  ): Promise<Category> {
    this.validateInput(CategoryUpdateInputSchema, input);
    myLogger.debug("getting category by", { id: input.searchBy.id });
    const category = await this.repository.getOneBy(
      {
        searchBy: { id: input.searchBy.id },
      },
      transactionManager
    );

    if (!category) {
      throw new ApplicationError("category not found", ErrorCode.NOT_FOUND);
    }
    myLogger.debug("category found", { id: input.searchBy.id });

    return this.repository.update(category, input.data, transactionManager);
  }

  delete(input: CategoryLookUpInput): Promise<void>;
  delete(input: CategoryLookUpInput, transactionManager: any): Promise<void>;
  async delete(
    input: CategoryLookUpInput,
    transactionManager?: any
  ): Promise<void> {
    this.validateInput(IntegerLookUpInputSchema, input);
    myLogger.debug("getting category by", { id: input.id });
    const category = await this.repository.getOneBy(
      {
        searchBy: { id: input.id },
      },
      transactionManager
    );

    if (!category) {
      throw new ApplicationError("category not found", ErrorCode.NOT_FOUND);
    }
    myLogger.debug("category found", { id: input.id });

    return this.repository.delete(category, transactionManager);
  }

  getOneBy(input: CategorySearchInput): Promise<Category | undefined>;
  getOneBy(
    input: CategorySearchInput,
    transactionManager: any
  ): Promise<Category | undefined>;
  getOneBy(
    input: CategorySearchInput,
    transactionManager?: any
  ): Promise<Category | undefined> {
    this.validateInput(CategorySearchInputSchema, input);
    return this.repository.getOneBy(input, transactionManager);
  }

  getManyBy(input: CategorySearchInput): Promise<Category[]> {
    this.validateInput(CategorySearchInputSchema, input);
    return this.repository.getManyBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
