import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AppLogger } from "@common/logging/logger";
import { Request } from "express";
import { ErrorCode, PresentationError } from "@common/errors";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { TokenVerifyFunction } from "@features/auth/ports/auth.use-case.definition";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { verifyToken, verifyTokenMocked } from "../../firebase/utils";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);
const tokenVerifyFunction: TokenVerifyFunction = APP_ENV_VARS.isProduction
  ? verifyToken
  : verifyTokenMocked;

function extractTokenFromRequest(req: Request): string {
  myLogger.debug("extracting token from request");

  let token: string;

  let parts: string[];
  if (req.headers?.["authorization"]) {
    parts = (req.headers["authorization"] as string).split(" ");
  } else if (req.headers?.["Authorization"]) {
    parts = (req.headers["Authorization"] as string).split(" ");
  } else {
    throw new PresentationError(
      "the required format is: Authorization: Bearer [token]",
      ErrorCode.UNAUTHORIZED
    );
  }

  if (parts.length == 2) {
    const scheme = parts[0];
    const credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    } else {
      throw new PresentationError(
        "the required format is: Authorization: Bearer [token]",
        ErrorCode.UNAUTHORIZED
      );
    }
  } else {
    throw new PresentationError(
      "the required format is: Authorization: Bearer [token]",
      ErrorCode.UNAUTHORIZED
    );
  }

  if (!token) {
    throw new PresentationError(
      "no authorization token was found",
      ErrorCode.UNAUTHORIZED
    );
  }

  myLogger.debug("token extracted from request");
  return token;
}

@Injectable()
export class AuthUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const token = extractTokenFromRequest(req);
    req.authuser = await tokenVerifyFunction(token);

    return true;
  }
}

@Injectable()
export class UserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const token = extractTokenFromRequest(req);
    const { appUserUseCase } = myAppUserFactory();

    const authUser = await tokenVerifyFunction(token);
    const appUser = await appUserUseCase.getOneBy({
      searchBy: { userId: authUser.id },
    });

    if (!appUser) {
      throw new PresentationError(
        "auth user exists, but app user does not",
        ErrorCode.APPLICATION_INTEGRITY_ERROR
      );
    }

    req.user = {
      authUser,
      appUser,
    };

    return true;
  }
}
