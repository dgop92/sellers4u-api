import { User } from "@features/auth/entities/user";
import { User as Auth0User } from "auth0";

export function auth0UserToDomain(auth0User: Auth0User): User {
  return {
    id: auth0User.user_id!,
    email: auth0User.email!,
  };
}
