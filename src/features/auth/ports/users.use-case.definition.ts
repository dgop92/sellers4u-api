import { User } from "../entities/user";
import { UserCreateInput, UserSearchInput } from "../schema-types";

export type UserLookUpField = {
  searchBy: {
    id: string;
  };
};

export interface IUserUseCase {
  create(input: UserCreateInput): Promise<User>;
  getOneBy(input: UserSearchInput): Promise<User | undefined>;
  delete(input: UserLookUpField): Promise<void>;
  getOrCreate(input: UserCreateInput): Promise<User>;
}
