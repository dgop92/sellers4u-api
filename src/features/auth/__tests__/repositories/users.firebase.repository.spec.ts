import { AppLogger } from "@common/logging/logger";
import { Auth as FirebaseAuth } from "firebase-admin/auth";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { FirebaseUserRepository } from "@features/auth/infrastructure/firebase/users.firebase.repository";
import { getAuthFirebaseClient } from "@features/auth/infrastructure/firebase/firebase-app";
import { User } from "@features/auth/entities/user";

import { ErrorCode, RepositoryError } from "@common/errors";
import {
  deleteAllFirebaseUsers,
  RANDOM_USER_ID,
} from "../mocks/firebase-test-helpers";
import { TEST_EMAILS } from "../mocks/users-test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("firebase repository", () => {
  let authFirebaseClient: FirebaseAuth;
  let firebaseUserRepository: FirebaseUserRepository;
  let user1: User;

  beforeAll(async () => {
    authFirebaseClient = getAuthFirebaseClient();
    firebaseUserRepository = new FirebaseUserRepository(authFirebaseClient);
  });

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      user1 = await firebaseUserRepository.create({
        email: TEST_EMAILS.emailTest1,
        password: "secret-PASSWORD-1234",
      });
    });

    it("should create a user", async () => {
      const email = TEST_EMAILS.emailTest2;
      const userData = {
        password: "secret-PASSWORD-1234",
        email,
      };
      const user = await firebaseUserRepository.create(userData);
      expect(user.email).toBe(userData.email);

      const userRetrieved = await firebaseUserRepository.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved).toBeDefined();
    });
    it("should throw an error if email is already taken", async () => {
      const email = TEST_EMAILS.emailTest1;
      const userData = {
        password: "secret-PASSWORD-1234",
        email,
      };
      try {
        await firebaseUserRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.errorParams.fieldName).toBe("email");
        }
      }
    });
  });

  describe("Get One By", () => {
    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      user1 = await firebaseUserRepository.create({
        email: TEST_EMAILS.emailTest1,
        password: "secret-PASSWORD-1234",
      });
    });
    it("should get a user by id", async () => {
      const user = await firebaseUserRepository.getOneBy({
        searchBy: { id: user1.id },
      });
      expect(user).toBeDefined();
      expect(user?.id).toBe(user1.id);
    });
    it("should not get a user by id", async () => {
      const user = await firebaseUserRepository.getOneBy({
        searchBy: { id: RANDOM_USER_ID },
      });
      expect(user).toBeUndefined();
    });
    it("should get a user by email", async () => {
      const user = await firebaseUserRepository.getOneBy({
        searchBy: { email: user1.email },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(user1.email);
    });
    it("should not get a user by email", async () => {
      const user = await firebaseUserRepository.getOneBy({
        searchBy: { email: TEST_EMAILS.emailTest4 },
      });
      expect(user).toBeUndefined();
    });
  });

  describe("Delete", () => {
    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      user1 = await firebaseUserRepository.create({
        email: TEST_EMAILS.emailTest1,
        password: "secret-PASSWORD-1234",
      });
    });
    it("should delete an user", async () => {
      await firebaseUserRepository.delete(user1);
      const user = await firebaseUserRepository.getOneBy({
        searchBy: { id: user1.id },
      });
      expect(user).toBeUndefined();
    });
  });
});
