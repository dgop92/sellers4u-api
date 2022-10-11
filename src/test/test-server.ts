import "reflect-metadata";
import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { AllExceptionsFilter } from "../main/nest/general-exception-filter";
import { authFactory } from "@features/auth/factories";
import { businessModuleFactory } from "@features/business/factories";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { productModuleFactory } from "@features/product/factories";
import { TestDBHelper } from "test/test-db-helper";
import { TestModule } from "./nest/test.module";

export async function startTestApp() {
  await TestDBHelper.instance.setupTestDB();
  const dataSource = TestDBHelper.instance.datasource;

  authFactory(dataSource);
  businessModuleFactory(dataSource);
  productModuleFactory(dataSource);

  const app = await NestFactory.create(TestModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  await app.listen(APP_ENV_VARS.port);

  myLogger.info("test app started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startTestApp();
