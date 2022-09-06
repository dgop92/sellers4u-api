import { User } from "../entities/user";
import { UserCreateInput, UserSearchInput } from "../schema-types";

export type UserCreateRepoData = UserCreateInput["data"];

export interface IUserRepository {
  create(input: UserCreateRepoData): Promise<User>;
  getOneBy(input: UserSearchInput): Promise<User | undefined>;
}
