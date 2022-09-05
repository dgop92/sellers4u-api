import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./general-exception-filter";
import { LoggerMiddleware } from "./logger-middleware";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
