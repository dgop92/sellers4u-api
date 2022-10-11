import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { AppLogger } from "@common/logging/logger";
import { firebaseUserToDomain } from "./transformers";
import { ErrorCode, RepositoryError } from "@common/errors";
import {
  IAuthUserRepository,
  AuthUserCreateRepoData,
} from "@features/auth/ports/auth-user.repository.definition";
import { AuthUser } from "@features/auth/entities/auth-user";
import { AuthUserSearchInput } from "@features/auth/schema-types";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class FirebaseUserRepository implements IAuthUserRepository {
  constructor(private readonly authFirebaseClient: FirebaseAuth) {}

  async create(input: AuthUserCreateRepoData): Promise<AuthUser> {
    myLogger.debug("creating auth user in firebase", { email: input.email });
    try {
      const firebaseUser = await this.authFirebaseClient.createUser({
        email: input.email,
        password: input.password,
      });
      myLogger.debug("auth user created in firebase", { email: input.email });
      return firebaseUserToDomain(firebaseUser);
    } catch (error) {
      if (error.errorInfo?.code === "auth/email-already-exists") {
        myLogger.debug("email already exists", { email: input.email });
        throw new RepositoryError(
          "the provided email is already in use by an existing auth user",
          ErrorCode.DUPLICATED_RECORD,
          { fieldName: "email" }
        );
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  async delete(authUser: AuthUser): Promise<void> {
    myLogger.debug("deleting auth user", { id: authUser.id });
    await this.authFirebaseClient.deleteUser(authUser.id);
    myLogger.debug("auth user deleted", { id: authUser.id });
  }

  getOneBy(input: AuthUserSearchInput): Promise<AuthUser | undefined> {
    const email = input.searchBy?.email;
    const id = input.searchBy?.id;

    if (email) {
      return this.getByEmail(email);
    }

    if (id) {
      return this.getById(id);
    }

    myLogger.debug("cannot get auth user because no search criteria provided");
    return Promise.resolve(undefined);
  }

  async getByEmail(email: string): Promise<AuthUser | undefined> {
    myLogger.debug("getting auth user by email", { email });
    try {
      const firebaseUser = await this.authFirebaseClient.getUserByEmail(email);
      return firebaseUserToDomain(firebaseUser);
    } catch (error) {
      if (error.errorInfo?.code === "auth/user-not-found") {
        myLogger.debug("auth user not found", { email });
        return undefined;
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  async getById(id: string): Promise<AuthUser | undefined> {
    myLogger.debug("getting auth user by id", { id });
    try {
      const firebaseUser = await this.authFirebaseClient.getUser(id);
      return firebaseUserToDomain(firebaseUser);
    } catch (error) {
      if (error.errorInfo?.code === "auth/user-not-found") {
        myLogger.debug("auth user not found", { id });
        return undefined;
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    myLogger.debug("deleting all auth users");
    const allUsers = await this.authFirebaseClient.listUsers();
    await Promise.all(
      allUsers.users.map((user) => this.authFirebaseClient.deleteUser(user.uid))
    );
    myLogger.debug("all auth users deleted");
  }

  async verifyToken(token: string): Promise<AuthUser> {
    let authUser: AuthUser;
    try {
      myLogger.debug("verifying token");
      const tokenPayload = await this.authFirebaseClient.verifyIdToken(token);
      myLogger.debug("token verified", { userId: tokenPayload.uid });
      authUser = {
        id: tokenPayload.uid,
        email: tokenPayload.email!,
      };
      return authUser;
    } catch (error) {
      throw new RepositoryError(
        error.errorInfo?.message || "invalid token",
        ErrorCode.UNAUTHORIZED
      );
    }
  }
}
