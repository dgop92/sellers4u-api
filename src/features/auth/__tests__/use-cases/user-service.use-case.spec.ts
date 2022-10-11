import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { FirebaseUserRepository } from "@features/auth/infrastructure/firebase/auth-user.firebase.repository";
import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { getAuthFirebaseClient } from "@features/auth/infrastructure/firebase/firebase-app";
import { RANDOM_USER_ID } from "../test-utils/firebase-test-helpers";
import { AuthUserUseCase } from "@features/auth/use-cases/auth-user.use-case.";
import { TEST_APP_USERS, TEST_EMAILS } from "../test-utils/users-test-data";
import { ApplicationError, ErrorCode, InvalidInputError } from "@common/errors";
import { AppUserUseCase } from "@features/auth/use-cases/app-user.use-case";
import { TestDBHelper } from "test/test-db-helper";
import { AppUserRepository } from "@features/auth/infrastructure/orm/repositories/app-user.repository";
import { UserServiceUseCase } from "@features/auth/use-cases/user-service.use-case";
import { User } from "@features/auth/entities/user";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("user service use-case", () => {
  let authUserUseCase: AuthUserUseCase;
  let appUserUseCase: AppUserUseCase;
  let userServiceUseCase: UserServiceUseCase;
  let authFirebaseClient: FirebaseAuth;
  let firebaseUserRepository: FirebaseUserRepository;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    authFirebaseClient = getAuthFirebaseClient();

    firebaseUserRepository = new FirebaseUserRepository(authFirebaseClient);
    authUserUseCase = new AuthUserUseCase(firebaseUserRepository);
    const appUserRepository = new AppUserRepository(
      TestDBHelper.instance.datasource
    );
    appUserUseCase = new AppUserUseCase(appUserRepository);
    userServiceUseCase = new UserServiceUseCase(
      authUserUseCase,
      appUserUseCase
    );
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await firebaseUserRepository.deleteAll();
      await TestDBHelper.instance.clear();
      await userServiceUseCase.create({
        authUserData: {
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
      const user = await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest2,
          password: "secret-PASSWORD-1234",
        },
        appUserData: TEST_APP_USERS.appUserTest2,
      });
      expect(user.authUser.email).toBe(TEST_EMAILS.emailTest2);
      expect(user.appUser.firstName).toBe(
        TEST_APP_USERS.appUserTest2.firstName
      );
      expect(user.appUser.lastName).toBe(TEST_APP_USERS.appUserTest2.lastName);
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: user.authUser.id },
      });
      expect(userServiceRetrieved).toBeDefined();
    });
    it("should throw an error if email is already in use", async () => {
      try {
        await userServiceUseCase.create({
          authUserData: {
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
    it("should link auth user to app user", async () => {
      await authUserUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
      });
      const user = await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
        appUserData: TEST_APP_USERS.appUserTest2,
      });
      expect(user.authUser.email).toBe(TEST_EMAILS.emailTest3);
    });
  });

  describe("Get One By", () => {
    let user1: User;

    beforeEach(async () => {
      await firebaseUserRepository.deleteAll();
      await TestDBHelper.instance.clear();
      user1 = await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
        appUserData: {
          firstName: TEST_APP_USERS.appUserTest1.firstName,
          lastName: TEST_APP_USERS.appUserTest2.lastName,
        },
      });
    });

    it("should get a user", async () => {
      const userRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: user1.authUser.id },
      });
      expect(userRetrieved).toBeDefined();
      expect(userRetrieved?.authUser.id).toBe(user1.authUser.id);
    });
    it("should not get a user service", async () => {
      const userRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: RANDOM_USER_ID },
      });
      expect(userRetrieved).toBeUndefined();
    });
    it("should throw integrity error if one of the users are not found", async () => {
      const user = await authUserUseCase.create({
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
    let user: User;

    beforeEach(async () => {
      await firebaseUserRepository.deleteAll();
      await TestDBHelper.instance.clear();
      user = await userServiceUseCase.create({
        authUserData: {
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
        searchBy: { id: user.authUser.id },
      });
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: user.authUser.id },
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
