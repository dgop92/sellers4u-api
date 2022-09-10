import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";

import { ErrorCode, RepositoryError } from "@common/errors";
import { AppUserRepository } from "@features/auth/infrastructure/orm/repositories/app-user.repository";
import { TestDBHelper } from "test/test-db-helper";
import { AppUser } from "@features/auth/entities/app-user";
import { TEST_APP_USERS, TEST_USERS } from "../mocks/users-test-data";
import { RANDOM_USER_ID } from "../mocks/firebase-test-helpers";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

// NOTE: must use firstName because AppUser does not contain userId

describe("app user repository", () => {
  let appUserRepository: AppUserRepository;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    appUserRepository = new AppUserRepository(TestDBHelper.instance.datasource);
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should create an app user", async () => {
      const inputData = TEST_APP_USERS.appUserTest2;
      const appUser = await appUserRepository.create(inputData);
      expect(appUser?.firstName).toBe(TEST_APP_USERS.appUserTest2.firstName);

      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { userId: TEST_USERS.userTest2.id },
      });
      expect(appUserRetrieved).toBeDefined();
    });
    it("should throw error if userId is already in use", async () => {
      const inputData = {
        firstName: "Pedroski",
        lastName: "Tomski",
        userId: TEST_USERS.userTest1.id,
      };
      try {
        await appUserRepository.create(inputData);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.errorParams.fieldName).toBe("userId");
        }
      }
    });
  });
  describe("Get One By", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should get an app user by userId", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { userId: TEST_APP_USERS.appUserTest1.userId },
      });
      expect(appUserRetrieved).toBeDefined();
      expect(appUserRetrieved?.firstName).toBe(appUser1.firstName);
    });
    it("should not get an app user by userId", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { userId: RANDOM_USER_ID },
      });
      expect(appUserRetrieved).toBeUndefined();
    });
    it("should get an app user by id", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { id: appUser1.id },
      });
      expect(appUserRetrieved).toBeDefined();
      expect(appUserRetrieved?.firstName).toBe(appUser1.firstName);
    });
    it("should not get an app user by id", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { id: 1234 },
      });
      expect(appUserRetrieved).toBeUndefined();
    });
  });

  describe("Update", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should update an app user", async () => {
      const appUserUpdated = await appUserRepository.update(appUser1, {
        firstName: "Jonas",
        lastName: "Jonaitis",
      });
      expect(appUserUpdated.firstName).toBe("Jonas");
      expect(appUserUpdated.lastName).toBe("Jonaitis");
    });
  });
  describe("Delete", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should delete an app user", async () => {
      await appUserRepository.delete(appUser1);
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { id: appUser1.id },
      });
      expect(appUserRetrieved).toBeUndefined();
    });
  });
});
