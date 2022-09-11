import { ApplicationError, ErrorCode } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { UserService } from "../entities/user-service";
import { IAppUserUseCase } from "../ports/app-user.use-case.definition";
import {
  IUserService,
  UserServicCreateInput,
  UserServicLookUpInput,
} from "../ports/user-service.use-case.definition";
import { IUserUseCase } from "../ports/users.use-case.definition";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class UserServiceUseCase implements IUserService {
  constructor(
    private readonly userUseCase: IUserUseCase,
    private readonly appUserUseCase: IAppUserUseCase
  ) {}

  /**
   * Create a new user and app user and link them together
   *
   * If the creation of the app user fails, a user will exists with no
   * app user linked to it. To solve this issue we use get or create
   * to retrieve the no linked user and link it to the app user
   *
   * @param input User data and app user data
   * @returns The created user and app user
   */
  async create(input: UserServicCreateInput): Promise<UserService> {
    myLogger.debug("creating or getting user");
    const user = await this.userUseCase.getOrCreate({
      data: input.userData,
    });
    const userId = user.id;
    myLogger.debug("user created or got", { email: user.email, userId });

    myLogger.debug("checking if user has an app user");
    const existing = await this.appUserUseCase.getOneBy({
      searchBy: { userId: userId },
    });
    if (existing) {
      myLogger.debug("user has an app user", { userId });
      throw new ApplicationError(
        "the provided email is already in use by an existing user",
        ErrorCode.DUPLICATED_RECORD,
        { fieldName: "email" }
      );
    }
    myLogger.debug("user has no app user, creating one", { userId });
    const appUser = await this.appUserUseCase.create({
      data: { ...input.appUserData, userId: userId },
    });
    myLogger.debug("app user created", { userId, appUserId: appUser.id });
    return {
      user,
      appUser,
    };
  }

  /**
   * Get a user and its app user
   *
   * Both user and an app user must exist, otherwise the result is
   * an application integrity error
   *
   * @param input userId
   * @returns The user and its app user
   */
  async getOneByUserId(
    input: UserServicLookUpInput
  ): Promise<UserService | undefined> {
    const userId = input.searchBy.id;
    myLogger.debug("getting user by user id");
    const user = await this.userUseCase.getOneBy({ searchBy: { id: userId } });
    const appUser = await this.appUserUseCase.getOneBy({
      searchBy: { userId: userId },
    });

    if (!user || !appUser) {
      myLogger.debug("user and app user not found", { userId });
      return undefined;
    }

    if (user || appUser) {
      myLogger.debug("user and app user found", {
        userId,
        appUserId: appUser.id,
      });
      return {
        user,
        appUser,
      };
    }

    const errorParams = {
      appUserFound: !!appUser,
      userFound: !!user,
      userId,
    };

    myLogger.error("user or app user not found, integrity error", errorParams);
    throw new ApplicationError(
      "user or app user not found",
      ErrorCode.APPLICATION_INTEGRITY_ERROR,
      errorParams
    );
  }

  /**
   * Delete a user and its app user
   *
   * Both user and an app user must exist, otherwise the result is
   * an application integrity error
   *
   * @param input userId
   * @returns void
   */
  async delete(input: UserServicLookUpInput): Promise<void> {
    const userId = input.searchBy.id;
    myLogger.debug("trying to get user with user id");
    const users = await this.getOneByUserId(input);
    if (!users) {
      myLogger.debug("user and app user not found, cannot delete", { userId });
      throw new ApplicationError(
        "user and app user with given user id not found",
        ErrorCode.NOT_FOUND
      );
    }
    myLogger.debug("deleting user and app user", { userId });
    await this.userUseCase.delete({ searchBy: { id: userId } });
    await this.appUserUseCase.delete({ searchBy: { id: users.appUser.id } });
    myLogger.debug("user and app user deleted", { userId });
  }
}
