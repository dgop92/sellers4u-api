import { ApplicationError, ErrorCode } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import Joi from "joi";
import {
  User,
  UserCreateInputSchema,
  UserSearchInputSchema,
} from "../entities/user";
import { IUserRepository } from "../ports/users.repository.definition";
import {
  IUserUseCase,
  UserLookUpField,
} from "../ports/users.use-case.definition";
import { UserCreateInput, UserSearchInput } from "../schema-types";
import { SearchByUidSchema } from "../utils";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class UserUseCase implements IUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async create(input: UserCreateInput): Promise<User> {
    myLogger.debug("validating user create data");
    this.validateInput(UserCreateInputSchema, input);
    /* 
    const hashedPassword = await bcrypt.hash(input.data.password, 8);
    const email = input.data.email;
    */
    myLogger.debug("create user using repository", { email: input.data.email });
    return this.userRepository.create(input.data);
  }

  async delete(input: UserLookUpField): Promise<void> {
    myLogger.debug("validating user delete data");
    this.validateInput(SearchByUidSchema, input);

    myLogger.debug("trying to get user", { id: input.searchBy.id });
    const user = await this.userRepository.getOneBy({
      searchBy: { id: input.searchBy.id },
    });

    if (!user) {
      myLogger.debug("user not found, cannot delete", {
        id: input.searchBy.id,
      });
      throw new ApplicationError(
        "user with given id was not found",
        ErrorCode.NOT_FOUND
      );
    }

    myLogger.debug("user found, deleting", { id: input.searchBy.id });
    this.userRepository.delete(user);
  }

  getOneBy(input: UserSearchInput): Promise<User | undefined> {
    myLogger.debug("validating user search data");
    this.validateInput(UserSearchInputSchema, input);
    myLogger.debug("get user using repository", input);
    return this.userRepository.getOneBy(input);
  }

  async getOrCreate(input: UserCreateInput): Promise<User> {
    myLogger.debug("validating user create data");
    this.validateInput(UserCreateInputSchema, input);

    const email = input.data.email;
    myLogger.debug("trying to get user with email", { email });
    const user = await this.userRepository.getOneBy({ searchBy: { email } });
    if (user) {
      myLogger.debug("user found with email", { email });
      return user;
    }

    myLogger.debug("user not found with email", { email });
    myLogger.debug("creating new user with email", { email });
    return this.userRepository.create(input.data);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
