import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import Joi from "joi";
import { AppUser } from "../entities/app-user";
import { IAppUserRepository } from "../ports/app-user.repository.definition";
import {
  AppUserLookUpField,
  IAppUserUseCase,
} from "../ports/app-user.use-case.definition";
import { IUserUseCase } from "../ports/users.use-case.definition";
import {
  AppUserCreateInput,
  AppUserUpdateInput,
  AppUserSearchInput,
} from "../schema-types";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class AppUserUseCase implements IAppUserUseCase {
  private userUseCase: IUserUseCase;
  constructor(private readonly userRepository: IAppUserRepository) {}

  setDependencies(userUseCase: IUserUseCase) {
    this.userUseCase = userUseCase;
  }

  create(input: AppUserCreateInput): Promise<AppUser>;
  create(input: AppUserCreateInput, transactionManager?: any): Promise<AppUser>;
  async create(
    input: AppUserCreateInput,
    transactionManager?: any
  ): Promise<AppUser> {
    throw new Error("Method not implemented.");
  }

  update(input: AppUserUpdateInput): Promise<AppUser>;
  update(input: AppUserUpdateInput, transactionManager?: any): Promise<AppUser>;
  update(
    input: AppUserUpdateInput,
    transactionManager?: any
  ): Promise<AppUser> {
    throw new Error("Method not implemented.");
  }

  delete(input: AppUserLookUpField): Promise<AppUser>;
  delete(input: AppUserLookUpField, transactionManager?: any): Promise<AppUser>;
  delete(
    input: AppUserLookUpField,
    transactionManager?: any
  ): Promise<AppUser> {
    throw new Error("Method not implemented.");
  }

  getOneBy(input: AppUserSearchInput): Promise<AppUser | undefined>;
  getOneBy(
    input: AppUserSearchInput,
    transactionManager?: any
  ): Promise<AppUser | undefined>;
  getOneBy(
    input: AppUserSearchInput,
    transactionManager?: any
  ): Promise<AppUser | undefined> {
    throw new Error("Method not implemented.");
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
