import { Auth as FirebaseAuth } from "firebase-admin/auth";

export const TEST_EMAILS = {
  emailTest1: "test-email-1@example.com",
  emailTest2: "test-email-2@example.com",
  emailTest3: "test-email-3@example.com",
  emailTest4: "test-email-4@example.com",
};

export async function deleteAllUsers(authFirebaseClient: FirebaseAuth) {
  const listUsersResult = await authFirebaseClient.listUsers(100);
  const uids = listUsersResult.users.map((userRecord) => userRecord.uid);
  if (uids.length > 0) {
    console.log(uids);
    await authFirebaseClient.deleteUsers(uids);
  }
}

export const RANDOM_USER_ID = "G1J2tcEfOFYBycm8ZcXi9tZjN852";
