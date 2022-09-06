import "reflect-metadata";
import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppDataSource } from "./db/data-source";
import { AppModule } from "./nest/app.module";
import { AllExceptionsFilter } from "./nest/general-exception-filter";

export async function startApp() {
  const dataSource = await AppDataSource.initialize();
  await dataSource.runMigrations();

  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  await app.listen(3000);

  myLogger.info("app started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
