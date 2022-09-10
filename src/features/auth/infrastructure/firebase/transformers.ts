import { User } from "@features/auth/entities/user";
import { UserRecord } from "firebase-admin/auth";

export function firebaseUserToDomain(firebaseUser: UserRecord): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
  };
}
