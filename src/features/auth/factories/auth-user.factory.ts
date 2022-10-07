import { AppLogger } from "@common/logging/logger";
import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { IAuthUserRepository } from "../ports/auth-user.repository.definition";
import { IAuthUserUseCase } from "../ports/auth-user.use-case.definition";
import { AuthUserUseCase } from "../use-cases/auth-user.use-case.";
import { FirebaseUserRepository } from "../infrastructure/firebase/auth-user.firebase.repository";
import { getAuthFirebaseClient } from "../infrastructure/firebase/firebase-app";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AuthUserMockedRepository } from "../infrastructure/firebase/auth-user.mock.repository";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let authFirebaseClient: FirebaseAuth;
let authUserRepository: IAuthUserRepository;
let authUserUseCase: IAuthUserUseCase;

export const myAuthUserFactory = () => {
  myLogger.info("calling authUserFactory");

  if (authUserRepository === undefined) {
    myLogger.info("creating authUserRepository");
    if (APP_ENV_VARS.isTest) {
      authUserRepository = new AuthUserMockedRepository();
    } else {
      authFirebaseClient = getAuthFirebaseClient();
      authUserRepository = new FirebaseUserRepository(authFirebaseClient);
    }
    myLogger.info("authUserRepository created");
  }

  if (authUserUseCase === undefined) {
    myLogger.info("creating authUserUseCase");
    authUserUseCase = new AuthUserUseCase(authUserRepository);
    myLogger.info("authUserUseCase created");
  }

  return {
    authFirebaseClient,
    authUserRepository,
    authUserUseCase,
  };
};
