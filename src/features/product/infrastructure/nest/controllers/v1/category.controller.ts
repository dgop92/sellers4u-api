import { ErrorCode, PresentationError } from "@common/errors";
import { AuthUserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import { myCategoryFactory } from "@features/product/factories/category/category.factory";
import { ICategoryUseCase } from "@features/product/ports/category.use-case.definition";
import { CategorySearchInput } from "@features/product/schema-types";
import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
} from "@nestjs/common";

type QueryParams = CategorySearchInput["searchBy"];

@Controller({
  path: "categories",
  version: "1",
})
export class CategoryControllerV1 {
  private categoryUseCase: ICategoryUseCase;
  constructor() {
    const { categoryUseCase } = myCategoryFactory();
    this.categoryUseCase = categoryUseCase;
  }

  @UseGuards(AuthUserGuard)
  @Get()
  getMany(@Query() query: QueryParams) {
    return this.categoryUseCase.getManyBy({
      searchBy: { id: query?.id, name: query?.name },
    });
  }

  @UseGuards(AuthUserGuard)
  @Get(":id")
  async getOne(@Param("id", ParseIntPipe) id: number) {
    const category = await this.categoryUseCase.getOneBy({
      searchBy: { id },
    });
    if (!category) {
      throw new PresentationError("category not found", ErrorCode.NOT_FOUND);
    }
    return category;
  }
}
