import * as auth0 from "auth0";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export function getAuth0ManagementClient(): auth0.ManagementClient {
  myLogger.info("creating auth0 management client");
  const auth0ManagementClient = new auth0.ManagementClient({
    domain: `${APP_ENV_VARS.auth0.domain}.auth0.com`,
    clientId: APP_ENV_VARS.auth0.clientId,
    clientSecret: APP_ENV_VARS.auth0.clientSecret,
    scope: "read:users create:users",
  });
  myLogger.info("created auth0 management client");
  return auth0ManagementClient;
}
