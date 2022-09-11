import { UserService } from "../entities/user-service";
import { AppUserCreateInput, AuthUserCreateInput } from "../schema-types";

export type UserServicCreateInput = {
  authUserData: AuthUserCreateInput["data"];
  appUserData: Omit<AppUserCreateInput["data"], "userId">;
};

export type UserServicLookUpInput = {
  searchBy: {
    id: string;
  };
};

export interface IUserService {
  create(input: UserServicCreateInput): Promise<UserService>;
  getOneByUserId(
    input: UserServicLookUpInput
  ): Promise<UserService | undefined>;
  delete(input: UserServicLookUpInput): Promise<void>;
}
