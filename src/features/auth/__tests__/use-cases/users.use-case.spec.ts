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
import { TEST_EMAILS } from "../mocks/users-test-data";
import { ApplicationError, ErrorCode, InvalidInputError } from "@common/errors";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("users use-case", () => {
  let userUseCase: UserUseCase;
  let authFirebaseClient: FirebaseAuth;

  beforeAll(async () => {
    authFirebaseClient = getAuthFirebaseClient();
    const firebaseUserRepository = new FirebaseUserRepository(
      authFirebaseClient
    );
    userUseCase = new UserUseCase(firebaseUserRepository);
  });

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      await userUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
      });
    });

    it("should create a user", async () => {
      const email = TEST_EMAILS.emailTest2;
      const userData = {
        password: "secret-PASSWORD-1234",
        email,
      };
      const user = await userUseCase.create({ data: userData });
      expect(user.email).toBe(userData.email);

      const userRetrieved = await userUseCase.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved).toBeDefined();
    });
    it("should get or create a user", async () => {
      const email = TEST_EMAILS.emailTest3;
      const userData = {
        password: "secret-PASSWORD-1234",
        email,
      };
      // Case: Creating a new user
      const user1 = await userUseCase.getOrCreate({ data: userData });
      expect(user1.email).toBe(userData.email);
      const userRetrieved1 = await userUseCase.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved1).toBeDefined();

      // Case: Getting an existing user
      const user2 = await userUseCase.getOrCreate({ data: userData });
      expect(user2.email).toBe(userData.email);
      const userRetrieved2 = await userUseCase.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved2).toBeDefined();
    });
  });

  describe("Delete", () => {
    let user1: User;

    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      user1 = await userUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
      });
    });

    it("should delete an user", async () => {
      await userUseCase.delete({ searchBy: { id: user1.id } });
      const userRetrieved = await userUseCase.getOneBy({
        searchBy: { id: user1.id },
      });
      expect(userRetrieved).toBeUndefined();
    });
    it("should throw an error if user is not found", async () => {
      try {
        await userUseCase.delete({ searchBy: { id: RANDOM_USER_ID } });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Get One By", () => {
    let user1: User;

    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      user1 = await userUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
      });
    });

    // positive test cases
    it("should get a user by email", async () => {
      const user = await userUseCase.getOneBy({
        searchBy: { email: TEST_EMAILS.emailTest1 },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(TEST_EMAILS.emailTest1);
    });
    it("should get a user by id", async () => {
      const user = await userUseCase.getOneBy({
        searchBy: { id: user1.id },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(TEST_EMAILS.emailTest1);
    });
    it("should not get a user by email", async () => {
      const user = await userUseCase.getOneBy({
        searchBy: { email: "non-existing-email@gmail.com" },
      });
      expect(user).toBeUndefined();
    });
    it("should not get a user by id", async () => {
      const user = await userUseCase.getOneBy({
        searchBy: { id: RANDOM_USER_ID },
      });
      expect(user).toBeUndefined();
    });
  });
});

describe("users use-case invalid input", () => {
  let userUseCase: UserUseCase;

  beforeAll(async () => {
    userUseCase = new UserUseCase(undefined!);
  });

  describe("Create Invalid Input", () => {
    // invalid input test cases
    it("should throw an error if email is not provided", async () => {
      try {
        await userUseCase.create({
          data: { password: "secret-PASSWORD-1234" },
        } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("email");
        }
      }
    });

    it("should throw an error if password is not provided", async () => {
      try {
        await userUseCase.create({
          data: { email: TEST_EMAILS.emailTest2 },
        } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("password");
        }
      }
    });

    it("should throw an error if email is not valid", async () => {
      try {
        await userUseCase.create({
          data: { email: "invalid-email", password: "secret-PASSWORD-1234" },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("email");
        }
      }
    });

    it("should throw an error if password is not strong enough", async () => {
      try {
        await userUseCase.create({
          data: { email: TEST_EMAILS.emailTest2, password: "1234" },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("password");
        }
      }
    });
  });

  describe("Get One By Invalid Input", () => {
    // invalid input test cases
    it("should throw an error if email is not valid", async () => {
      try {
        await userUseCase.getOneBy({
          searchBy: { email: "invalid-email" },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("email");
        }
      }
    });
  });
});