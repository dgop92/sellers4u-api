import { AuthModule } from "@features/auth/infrastructure/nest/auth.module";
import { BusinessModule } from "@features/business/infrastructure/nest/business.module";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, RouterModule } from "@nestjs/core";
import { AllExceptionsFilter } from "./general-exception-filter";
import { LoggerMiddleware } from "./logger-middleware";

@Module({
  imports: [
    AuthModule,
    BusinessModule,
    RouterModule.register([
      {
        path: "auth",
        module: AuthModule,
      },
      {
        path: "business",
        module: BusinessModule,
      },
    ]),
  ],

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
