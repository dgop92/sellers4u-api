import { validateDataWithJoi } from "@common/validations";
import Joi from "joi";
import { LoginInputSchema } from "../entities/auth";
import { User } from "../entities/user";
import { IUserRepository } from "../ports/users.repository.definition";
import { IUserUseCase } from "../ports/users.use-case.definition";
import { UserCreateInput, UserSearchInput } from "../schema-types";

export class UserUseCase implements IUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async create(input: UserCreateInput): Promise<User> {
    this.validateInput(LoginInputSchema, input);
    /* 
    const hashedPassword = await bcrypt.hash(input.data.password, 8);
    const email = input.data.email;
    */
    return this.userRepository.create(input.data);
  }

  getOneBy(input: UserSearchInput): Promise<User | undefined> {
    this.validateInput(LoginInputSchema, input);
    return this.userRepository.getOneBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
