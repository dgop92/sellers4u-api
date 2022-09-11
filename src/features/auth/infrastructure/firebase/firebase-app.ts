import { AppLogger } from "@common/logging/logger";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let authFirebaseClient: Auth;

export function getAuthFirebaseClient() {
  myLogger.info("trying to get auth firebase client");
  if (!authFirebaseClient) {
    myLogger.info("creating auth firebase client");
    const app = initializeApp({
      credential: applicationDefault(),
    });
    authFirebaseClient = getAuth(app);
    myLogger.info("auth firebase client created");
  }
  myLogger.info("auth firebase client returned");
  return authFirebaseClient;
}
