import * as auth0 from "auth0";
import {
  IUserRepository,
  UserCreateRepoData,
} from "@features/auth/ports/users.repository.definition";
import { User } from "@features/auth/entities/user";
import { UserSearchInput } from "@features/auth/schema-types";
import { auth0UserToDomain } from "./transformers";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class Auth0UserRepository implements IUserRepository {
  constructor(
    private auth0ManagementClient: auth0.ManagementClient,
    private connectionName: string
  ) {}

  async create(input: UserCreateRepoData): Promise<User> {
    myLogger.debug("creating user in Auth0", { email: input.email });
    const auth0User = await this.auth0ManagementClient.createUser({
      email: input.email,
      password: input.password,
      connection: this.connectionName,
    });
    myLogger.debug("user created in Auth0", { email: input.email });
    return auth0UserToDomain(auth0User);
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

  private async getByEmail(email: string): Promise<User | undefined> {
    myLogger.debug("getting user by email", { email });
    // TODO: encodeURIComponent "q" property if needed
    const auth0User = await this.auth0ManagementClient.getUsers({
      q: `email:"${email}" AND identities.connection:"${this.connectionName}"`,
      search_engine: "v3",
      include_fields: true,
      fields: "user_id,email",
    });
    if (auth0User.length !== 0) {
      return auth0UserToDomain(auth0User[0]);
    }
    myLogger.debug("user not found", { email });
    return undefined;
  }

  private async getById(id: string): Promise<User | undefined> {
    myLogger.debug("getting user by id", { id });
    const auth0User = await this.auth0ManagementClient.getUsers({
      q: `identities.user_id:${id} AND identities.connection:"${this.connectionName}"`,
      search_engine: "v3",
      include_fields: true,
      fields: "user_id,email",
    });
    if (auth0User) {
      return auth0UserToDomain(auth0User[0]);
    }
    myLogger.debug("user not found", { id });
    return undefined;
  }
}
