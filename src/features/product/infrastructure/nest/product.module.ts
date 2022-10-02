import { Module } from "@nestjs/common";
import { CategoryControllerV1 } from "./controllers/v1/category.controller";

@Module({
  controllers: [CategoryControllerV1],
})
export class ProductModule {}
