import { UserRecord } from "firebase-admin/auth";
import { User } from "../entities/user";

export function firebaseUserToDomain(firebaseUser: UserRecord): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
  };
}
