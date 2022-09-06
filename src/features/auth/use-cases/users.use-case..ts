import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import Joi from "joi";
import { LoginInputSchema } from "../entities/auth";
import { User } from "../entities/user";
import { IUserRepository } from "../ports/users.repository.definition";
import { IUserUseCase } from "../ports/users.use-case.definition";
import { UserCreateInput, UserSearchInput } from "../schema-types";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class UserUseCase implements IUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async create(input: UserCreateInput): Promise<User> {
    myLogger.debug("validate user create data", { email: input.data.email });
    this.validateInput(LoginInputSchema, input);
    /* 
    const hashedPassword = await bcrypt.hash(input.data.password, 8);
    const email = input.data.email;
    */
    myLogger.debug("create user using repository", { email: input.data.email });
    return this.userRepository.create(input.data);
  }

  getOneBy(input: UserSearchInput): Promise<User | undefined> {
    myLogger.debug("validate user search data", input);
    this.validateInput(LoginInputSchema, input);
    myLogger.debug("get user using repository", input);
    return this.userRepository.getOneBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
