import { Module } from "@nestjs/common";
import { UserControllerV1 } from "./controllers/v1/user.controller";

@Module({
  controllers: [UserControllerV1],
})
export class AuthModule {}
