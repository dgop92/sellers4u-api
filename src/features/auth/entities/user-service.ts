import { AppUser } from "./app-user";
import { AuthUser } from "./auth-user";

export interface UserService {
  user: AuthUser;
  appUser: AppUser;
}
