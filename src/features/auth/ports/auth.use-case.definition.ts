import { User } from "../entities/user";
import { LoginInput } from "../schema-types";

export interface IAuthUseCase {
  login(input: LoginInput): Promise<User>;
}