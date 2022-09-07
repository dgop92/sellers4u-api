import { v4 as uuidv4 } from "uuid";
import { getAuth0ManagementClient } from "@features/auth/infrastructure/auth0/managment-client";
import { Auth0UserRepository } from "@features/auth/infrastructure/auth0/users.auth0.repository";
import { addUUIdToEmail } from "./user-creation-helper";
import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { APP_ENV_VARS } from "@common/config/app-env-vars";

const fileUUId = uuidv4();

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);
winstonLogger.info("test file uuid", { fileUUId });

describe("auth0 repository spec", () => {
  let auth0UserRepository: Auth0UserRepository;

  beforeAll(() => {
    const managementClient = getAuth0ManagementClient();
    auth0UserRepository = new Auth0UserRepository(
      managementClient,
      APP_ENV_VARS.auth0.dbConnectionName
    );
  });

  describe("Create", () => {
    it("should create a user", async () => {
      const email = addUUIdToEmail("test-email-1@example.com", fileUUId);
      const userData = {
        password: "secret-PASSWORD-1234",
        email,
      };
      const user = await auth0UserRepository.create(userData);
      expect(user.email).toBe(userData.email);

      const userRetrieved = await auth0UserRepository.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved).toBeDefined();
    });
  });
});
