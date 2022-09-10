import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { AppLogger } from "@common/logging/logger";
import { firebaseUserToDomain } from "./transformers";
import { ErrorCode, RepositoryError } from "@common/errors";
import {
  IUserRepository,
  UserCreateRepoData,
} from "@features/auth/ports/users.repository.definition";
import { User } from "@features/auth/entities/user";
import { UserSearchInput } from "@features/auth/schema-types";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class FirebaseUserRepository implements IUserRepository {
  constructor(private readonly authFirebaseClient: FirebaseAuth) {}

  async create(input: UserCreateRepoData): Promise<User> {
    myLogger.debug("creating user in firebase", { email: input.email });
    try {
      const firebaseUser = await this.authFirebaseClient.createUser({
        email: input.email,
        password: input.password,
      });
      myLogger.debug("user created in firebase", { email: input.email });
      return firebaseUserToDomain(firebaseUser);
    } catch (error) {
      if (error.errorInfo?.code === "auth/email-already-exists") {
        myLogger.debug("email already exists", { email: input.email });
        throw new RepositoryError(
          "the provided email is already in use by an existing user",
          ErrorCode.DUPLICATED_RECORD,
          { fieldName: "email" }
        );
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  async delete(user: User): Promise<void> {
    myLogger.debug("deleting user", { id: user.id });
    await this.authFirebaseClient.deleteUser(user.id);
    myLogger.debug("user deleted", { id: user.id });
  }

  getOneBy(input: UserSearchInput): Promise<User | undefined> {
    const email = input.searchBy?.email;
    const id = input.searchBy?.id;

    if (email) {
      return this.getByEmail(email);
    }

    if (id) {
      return this.getById(id);
    }

    myLogger.debug("cannot get user because no search criteria provided");
    return Promise.resolve(undefined);
  }

  async getByEmail(email: string): Promise<User | undefined> {
    myLogger.debug("getting user by email", { email });
    try {
      const firebaseUser = await this.authFirebaseClient.getUserByEmail(email);
      return firebaseUserToDomain(firebaseUser);
    } catch (error) {
      if (error.errorInfo?.code === "auth/user-not-found") {
        myLogger.debug("user not found", { email });
        return undefined;
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }

  async getById(id: string): Promise<User | undefined> {
    myLogger.debug("getting user by id", { id });
    try {
      const firebaseUser = await this.authFirebaseClient.getUser(id);
      return firebaseUserToDomain(firebaseUser);
    } catch (error) {
      if (error.errorInfo?.code === "auth/user-not-found") {
        myLogger.debug("user not found", { id });
        return undefined;
      }
      myLogger.error(error?.stack);
      throw error;
    }
  }
}
