import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { FirebaseUserRepository } from "@features/auth/infrastructure/firebase/auth-user.firebase.repository";
import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { getAuthFirebaseClient } from "@features/auth/infrastructure/firebase/firebase-app";
import { AuthUser } from "@features/auth/entities/auth-user";
import { RANDOM_USER_ID } from "../mocks/firebase-test-helpers";
import { AuthUserUseCase } from "@features/auth/use-cases/auth-user.use-case.";
import { TEST_EMAILS } from "../mocks/users-test-data";
import { ApplicationError, ErrorCode, InvalidInputError } from "@common/errors";
import { deleteAllFirebaseUsers } from "@features/auth/infrastructure/firebase/utils";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("users use-case", () => {
  let authUserUseCase: AuthUserUseCase;
  let authFirebaseClient: FirebaseAuth;

  beforeAll(async () => {
    authFirebaseClient = getAuthFirebaseClient();
    const firebaseUserRepository = new FirebaseUserRepository(
      authFirebaseClient
    );
    authUserUseCase = new AuthUserUseCase(firebaseUserRepository);
  });

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      await authUserUseCase.create({
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
      const user = await authUserUseCase.create({ data: userData });
      expect(user.email).toBe(userData.email);

      const userRetrieved = await authUserUseCase.getOneBy({
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
      const user1 = await authUserUseCase.getOrCreate({ data: userData });
      expect(user1.email).toBe(userData.email);
      const userRetrieved1 = await authUserUseCase.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved1).toBeDefined();

      // Case: Getting an existing user
      const user2 = await authUserUseCase.getOrCreate({ data: userData });
      expect(user2.email).toBe(userData.email);
      const userRetrieved2 = await authUserUseCase.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved2).toBeDefined();
    });
  });

  describe("Delete", () => {
    let authUser1: AuthUser;

    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      authUser1 = await authUserUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
      });
    });

    it("should delete an user", async () => {
      await authUserUseCase.delete({ searchBy: { id: authUser1.id } });
      const userRetrieved = await authUserUseCase.getOneBy({
        searchBy: { id: authUser1.id },
      });
      expect(userRetrieved).toBeUndefined();
    });
    it("should throw an error if user is not found", async () => {
      try {
        await authUserUseCase.delete({ searchBy: { id: RANDOM_USER_ID } });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Get One By", () => {
    let authUser1: AuthUser;

    beforeEach(async () => {
      await deleteAllFirebaseUsers(authFirebaseClient);
      authUser1 = await authUserUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
      });
    });

    // positive test cases
    it("should get a user by email", async () => {
      const user = await authUserUseCase.getOneBy({
        searchBy: { email: TEST_EMAILS.emailTest1 },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(TEST_EMAILS.emailTest1);
    });
    it("should get a user by id", async () => {
      const user = await authUserUseCase.getOneBy({
        searchBy: { id: authUser1.id },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(TEST_EMAILS.emailTest1);
    });
    it("should not get a user by email", async () => {
      const user = await authUserUseCase.getOneBy({
        searchBy: { email: "non-existing-email@gmail.com" },
      });
      expect(user).toBeUndefined();
    });
    it("should not get a user by id", async () => {
      const user = await authUserUseCase.getOneBy({
        searchBy: { id: RANDOM_USER_ID },
      });
      expect(user).toBeUndefined();
    });
  });
});

describe("users use-case invalid input", () => {
  let authUserUseCase: AuthUserUseCase;

  beforeAll(async () => {
    authUserUseCase = new AuthUserUseCase(undefined!);
  });

  describe("Create Invalid Input", () => {
    // invalid input test cases
    it("should throw an error if email is not provided", async () => {
      try {
        await authUserUseCase.create({
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
        await authUserUseCase.create({
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
        await authUserUseCase.create({
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
        await authUserUseCase.create({
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
        await authUserUseCase.getOneBy({
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
