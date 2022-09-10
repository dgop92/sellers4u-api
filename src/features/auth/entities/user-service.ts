import { AppUser } from "./app-user";
import { User } from "./user";

export interface UserService {
  user: User;
  appUser: AppUser;
}
