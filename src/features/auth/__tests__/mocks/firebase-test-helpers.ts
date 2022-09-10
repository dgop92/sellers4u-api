import { Auth as FirebaseAuth } from "firebase-admin/auth";

export async function deleteAllFirebaseUsers(authFirebaseClient: FirebaseAuth) {
  const listUsersResult = await authFirebaseClient.listUsers(100);
  const uids = listUsersResult.users.map((userRecord) => userRecord.uid);
  if (uids.length > 0) {
    console.log(uids);
    await authFirebaseClient.deleteUsers(uids);
  }
}

export const RANDOM_USER_ID = "G1J2tcEfOFYBycm8ZcXi9tZjN852";
