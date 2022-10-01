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
  return {
    email: "some@email.com",
    id: "xx222deok33WOf22LCufOHXSOcxx",
  };
}
