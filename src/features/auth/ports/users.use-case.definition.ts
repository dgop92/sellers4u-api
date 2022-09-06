import { User } from "../entities/user";
import { UserCreateInput, UserSearchInput } from "../schema-types";

export interface IUserUseCase {
  create(input: UserCreateInput): Promise<User>;
  getOneBy(input: UserSearchInput): Promise<User | undefined>;
}
