import { AuthUser } from "../entities/auth-user";
import { LoginInput } from "../schema-types";

export interface IAuthUseCase {
  login(input: LoginInput): Promise<AuthUser>;
}
