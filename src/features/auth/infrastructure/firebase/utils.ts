import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { ErrorCode, PresentationError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { AuthUser } from "@features/auth/entities/auth-user";
import { myAuthUserFactory } from "@features/auth/factories/auth-user.factory";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export async function verifyToken(token: string): Promise<AuthUser> {
  const { authFirebaseClient } = myAuthUserFactory();

  let authUser: AuthUser;
  try {
    myLogger.debug("verifying token");
    const tokenPayload = await authFirebaseClient.verifyIdToken(token);
    myLogger.debug("token verified", { userId: tokenPayload.uid });
    authUser = {
      id: tokenPayload.uid,
      email: tokenPayload.email!,
    };
  } catch (error) {
    throw new PresentationError(
      error.errorInfo?.message || "invalid token",
      ErrorCode.UNAUTHORIZED
    );
  }

  return authUser;
}

export async function verifyTokenMocked(token: string): Promise<AuthUser> {
  try {
    return JSON.parse(token);
  } catch (error) {
    return {
      email: "some@email.com",
      id: "xx222deok33WOf22LCufOHXSOcxx",
    };
  }
}

export async function deleteAllFirebaseUsers(authFirebaseClient: FirebaseAuth) {
  const listUsersResult = await authFirebaseClient.listUsers(100);
  const uids = listUsersResult.users.map((userRecord) => userRecord.uid);
  if (uids.length > 0) {
    console.log(uids);
    await authFirebaseClient.deleteUsers(uids);
  }
}
