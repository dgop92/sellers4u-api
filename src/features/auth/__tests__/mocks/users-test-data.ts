export const TEST_EMAILS = {
  emailTest1: "test-email-1@example.com",
  emailTest2: "test-email-2@example.com",
  emailTest3: "test-email-3@example.com",
  emailTest4: "test-email-4@example.com",
};

export const TEST_USERS = {
  authUserTest1: {
    email: TEST_EMAILS.emailTest1,
    id: "G1d2tcEfOFYfcm8ZcXi9tZjN852",
  },
  authUserTest2: {
    email: TEST_EMAILS.emailTest2,
    id: "ffd2tcEfffYfgg8ZcXyytZuN853",
  },
  authUserTest3: {
    email: TEST_EMAILS.emailTest3,
    id: "mmmmtcnnnnYfgg8ZcXyytZua800",
  },
};

export const TEST_APP_USERS = {
  appUserTest1: {
    firstName: "John",
    lastName: "Doe",
    userId: TEST_USERS.authUserTest1.id,
  },
  appUserTest2: {
    firstName: "Juan",
    lastName: "Williams",
    userId: TEST_USERS.authUserTest2.id,
  },
};
