import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AppLogger } from "@common/logging/logger";
import { myAuthUserFactory } from "@features/auth/factories/auth-user.factory";
import { AuthUserMockedRepository } from "@features/auth/infrastructure/firebase/auth-user.mock.repository";
import { deleteAllFirebaseUsers } from "@features/auth/infrastructure/firebase/utils";
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { setupAuthModuleData } from "test/setup-data/auth.setup-data";
import { setupBusinessModuleData } from "test/setup-data/business.setup-data";
import { setupProductModuleData } from "test/setup-data/product.setup-data";
import { TestDBHelper } from "test/test-db-helper";

// THIS CONTROLLER IS ONLY USED IN TEST OR DEV ENVIRONMENTS

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

type SetupDataBody = {
  moduleToSetup: string;
};

@Controller({
  path: "db-seed",
  version: "1",
})
export class DBSeedControllerV1 {
  @Post("/clear-all")
  async clearDatabaseAndServices() {
    if (!APP_ENV_VARS.isProduction) {
      myLogger.debug("deleting database");
      await TestDBHelper.instance.clear();
      myLogger.debug("database deleted");
      myLogger.debug("deleting auth users");
      if (APP_ENV_VARS.isTest) {
        AuthUserMockedRepository.authUsers = [];
      } else {
        const { authFirebaseClient } = myAuthUserFactory();
        await deleteAllFirebaseUsers(authFirebaseClient);
      }
      myLogger.debug("auth users deleted");
      return { clearSuccessful: true };
    }
    throw new HttpException(
      {
        error: "This endpoint is only available in non-production environments",
      },
      HttpStatus.UNAUTHORIZED
    );
  }

  @Post("/clear-table")
  async clearTable(@Body() body: { tableName: string }) {
    if (!APP_ENV_VARS.isProduction) {
      try {
        myLogger.debug("deleting database");
        await TestDBHelper.instance.rawClearTable(body.tableName);
        myLogger.debug("database deleted");
        return { clearSuccessful: true };
      } catch (error) {
        throw new HttpException(
          {
            error: "Invalid table name",
          },
          HttpStatus.BAD_REQUEST
        );
      }
    }
    throw new HttpException(
      {
        error: "This endpoint is only available in non-production environments",
      },
      HttpStatus.UNAUTHORIZED
    );
  }

  @Post("/setup-data")
  async setupData(@Body() body: SetupDataBody) {
    if (!APP_ENV_VARS.isProduction) {
      myLogger.debug("setting up data", body);
      const { moduleToSetup } = body;
      switch (moduleToSetup) {
        case "auth":
          await setupAuthModuleData();
          break;
        case "business":
          await setupBusinessModuleData();
          break;
        case "product":
          await setupProductModuleData();
        default:
          throw new HttpException(
            {
              error:
                "Invalid module name, valid values are: auth, business, product",
            },
            HttpStatus.BAD_REQUEST
          );
      }
      myLogger.debug("data setup done");
      return { setupSuccessful: true };
    }
    throw new HttpException(
      {
        error: "This endpoint is only available in non-production environments",
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}
