import { AppUser } from "./app-user";
import { AuthUser } from "./user";

export interface UserService {
  user: AuthUser;
  appUser: AppUser;
}
