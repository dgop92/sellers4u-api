import { AppLogger } from "@common/logging/logger";
import { myUserServiceFactory } from "@features/auth/factories/user-service-factory";

export const TEST_SERVER_AUTH_USERS = {
  authUserTest1: {
    email: "test-email-1@example.com",
    id: "G1d2tcEfOFYfcm8ZcXi9tZjN852",
  },
  authUserTest2: {
    email: "test-email-2@example.com",
    id: "ffd2tcEfffYfgg8ZcXyytZuN853",
  },
  authUserTest3: {
    email: "test-email-4@example.com",
    id: "mmmmtcnnnnYfgg8ZcXyytZua800",
  },
};

export const TEST_SERVER_APP_USERS = {
  user1: {
    appUser: {
      firstName: "John",
      lastName: "Doe",
      userId: TEST_SERVER_AUTH_USERS.authUserTest1.id,
    },
    authUser: {
      email: TEST_SERVER_AUTH_USERS.authUserTest1.email,
      password: "John-Doe-password-1",
    },
  },
  user2: {
    appUser: {
      firstName: "Juan",
      lastName: "Williams",
      userId: TEST_SERVER_AUTH_USERS.authUserTest2.id,
    },
    authUser: {
      email: TEST_SERVER_AUTH_USERS.authUserTest2.email,
      password: "Juan-Williams-password-2",
    },
  },
  user3: {
    appUser: {
      firstName: "Pedro",
      lastName: "NewVillage",
      userId: TEST_SERVER_AUTH_USERS.authUserTest3.id,
    },
    authUser: {
      email: TEST_SERVER_AUTH_USERS.authUserTest3.email,
      password: "Pedro-NewVillage-password-3",
    },
  },
};

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

async function setupUsersData() {
  const { userServiceUseCase } = myUserServiceFactory();
  const promises = Object.values(TEST_SERVER_APP_USERS).map((user) =>
    userServiceUseCase.create({
      appUserData: user.appUser,
      authUserData: user.authUser,
    })
  );
  myLogger.info("setting up auth data");
  const users = await Promise.all(promises);
  myLogger.info("auth data successfully setup");
  return users;
}

export async function setupAuthModuleData() {
  const users = await setupUsersData();
  return { users };
}
