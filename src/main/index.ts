import "reflect-metadata";
import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { AppDataSource } from "./db/data-source";
import { AppModule } from "./nest/app.module";
import { AllExceptionsFilter } from "./nest/general-exception-filter";
import { authFactory } from "@features/auth/factories";
import { businessModuleFactory } from "@features/business/factories";
import { APP_ENV_VARS } from "@common/config/app-env-vars";

export async function startApp() {
  const dataSource = await AppDataSource.initialize();
  await dataSource.runMigrations();

  authFactory(dataSource);
  businessModuleFactory(dataSource);

  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  await app.listen(APP_ENV_VARS.port);

  myLogger.info("app started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
