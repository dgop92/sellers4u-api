import { Module } from "@nestjs/common";
import { CategoryControllerV1 } from "./controllers/v1/category.controller";
import { ProductControllerV1 } from "./controllers/v1/product.controller";

@Module({
  controllers: [CategoryControllerV1, ProductControllerV1],
})
export class ProductModule {}
