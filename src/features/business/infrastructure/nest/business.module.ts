import { Module } from "@nestjs/common";
import { BusinessControllerV1 } from "./controllers/v1/business.controller";

@Module({
  controllers: [BusinessControllerV1],
})
export class BusinessModule {}
