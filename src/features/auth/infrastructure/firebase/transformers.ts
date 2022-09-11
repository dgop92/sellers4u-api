import { AuthUser } from "@features/auth/entities/auth-user";
import { UserRecord } from "firebase-admin/auth";

export function firebaseUserToDomain(firebaseUser: UserRecord): AuthUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
  };
}
