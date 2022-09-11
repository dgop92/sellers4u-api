import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { FirebaseUserRepository } from "@features/auth/infrastructure/firebase/users.firebase.repository";
import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { getAuthFirebaseClient } from "@features/auth/infrastructure/firebase/firebase-app";
import { User } from "@features/auth/entities/user";
import {
  deleteAllFirebaseUsers,
  RANDOM_USER_ID,
} from "../mocks/firebase-test-helpers";
import { UserUseCase } from "@features/auth/use-cases/users.use-case.";
import { TEST_APP_USERS, TEST_EMAILS } from "../mocks/users-test-data";
import { ApplicationError, ErrorCode, InvalidInputError } from "@common/errors";
import { AppUserUseCase } from "@features/auth/use-cases/app-users.use-case";
import { TestDBHelper } from "test/test-db-helper";
import { AppUserRepository } from "@features/auth/infrastructure/orm/repositories/app-user.repository";
import { UserServiceUseCase } from "@features/auth/use-cases/user-service.use-case";
import { UserService } from "@features/auth/entities/user-service";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("user service use-case", () => {
  let userUseCase: UserUseCase;
  let appUserUseCase: AppUserUseCase;
  let userServiceUseCase: UserServiceUseCase;
  let authFirebaseClient: FirebaseAuth;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    authFirebaseClient = getAuthFirebaseClient();

    const firebaseUserRepository = new FirebaseUserRepository(
      authFirebaseClient
    );
    userUseCase = new UserUseCase(firebaseUserRepository);
    const appUserRepository = new AppUserRepository(
      TestDBHelper.instance.datasource
    );
    appUserUseCase = new AppUserUseCase(appUserRepository);
    userServiceUseCase = new UserServiceUseCase(userUseCase, appUserUseCase);
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      await TestDBHelper.instance.clear();
      await userServiceUseCase.create({
        userData: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
        appUserData: {
          firstName: TEST_APP_USERS.appUserTest1.firstName,
          lastName: TEST_APP_USERS.appUserTest2.lastName,
        },
      });
    });

    it("should create a user service", async () => {
      const userService = await userServiceUseCase.create({
        userData: {
          email: TEST_EMAILS.emailTest2,
          password: "secret-PASSWORD-1234",
        },
        appUserData: TEST_APP_USERS.appUserTest2,
      });
      expect(userService.user.email).toBe(TEST_EMAILS.emailTest2);
      expect(userService.appUser.firstName).toBe(
        TEST_APP_USERS.appUserTest2.firstName
      );
      expect(userService.appUser.lastName).toBe(
        TEST_APP_USERS.appUserTest2.lastName
      );
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: userService.user.id },
      });
      expect(userServiceRetrieved).toBeDefined();
    });
    it("should throw an error if email is already in use", async () => {
      try {
        await userServiceUseCase.create({
          userData: {
            email: TEST_EMAILS.emailTest1,
            password: "secret-PASSWORD-1234",
          },
          appUserData: TEST_APP_USERS.appUserTest2,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.errorParams.fieldName).toBe("email");
        }
      }
    });
    it("should link user to app user", async () => {
      await userUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
      });
      const userService = await userServiceUseCase.create({
        userData: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
        appUserData: TEST_APP_USERS.appUserTest2,
      });
      expect(userService.user.email).toBe(TEST_EMAILS.emailTest3);
    });
  });

  describe("Get One By", () => {
    let userService1: UserService;

    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      await TestDBHelper.instance.clear();
      userService1 = await userServiceUseCase.create({
        userData: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
        appUserData: {
          firstName: TEST_APP_USERS.appUserTest1.firstName,
          lastName: TEST_APP_USERS.appUserTest2.lastName,
        },
      });
    });

    it("should get a user service", async () => {
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: userService1.user.id },
      });
      expect(userServiceRetrieved).toBeDefined();
      expect(userServiceRetrieved?.user.id).toBe(userService1.user.id);
    });
    it("should not get a user service", async () => {
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: RANDOM_USER_ID },
      });
      expect(userServiceRetrieved).toBeUndefined();
    });
    it("should throw integrity error if one of the user are not found", async () => {
      const user = await userUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
      });
      try {
        await userServiceUseCase.getOneByUserId({
          searchBy: { id: user.id },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.APPLICATION_INTEGRITY_ERROR);
        }
      }
    });
  });

  describe("Delete", () => {
    let userService1: UserService;

    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      await TestDBHelper.instance.clear();
      userService1 = await userServiceUseCase.create({
        userData: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
        appUserData: {
          firstName: TEST_APP_USERS.appUserTest1.firstName,
          lastName: TEST_APP_USERS.appUserTest2.lastName,
        },
      });
    });

    it("should delete a user service", async () => {
      await userServiceUseCase.delete({
        searchBy: { id: userService1.user.id },
      });
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: userService1.user.id },
      });
      expect(userServiceRetrieved).toBeUndefined();
    });
    it("should throw an error if user service is not found", async () => {
      try {
        await userServiceUseCase.delete({
          searchBy: { id: RANDOM_USER_ID },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });
});
