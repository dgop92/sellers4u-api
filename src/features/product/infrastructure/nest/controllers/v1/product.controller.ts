import { ErrorCode, PresentationError } from "@common/errors";
import { User } from "@features/auth/entities/user";
import { GetUser } from "@features/auth/infrastructure/nest/custom-decorators";
import {
  AuthUserGuard,
  UserGuard,
} from "@features/auth/infrastructure/nest/guards/users.guard";
import { myProductFactory } from "@features/product/factories/product.factory";
import { IProductUseCase } from "@features/product/ports/product.use-case.definition";
import {
  ProductSearchInput,
  ProductCreateInput,
  ProductUpdateInput,
} from "@features/product/schema-types";
import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
} from "@nestjs/common";

type CreateProductRequest = ProductCreateInput["data"];
type UpdateProductRequest = ProductUpdateInput["data"];

type QueryParams = ProductSearchInput["searchBy"] &
  ProductSearchInput["options"];
type QueryParamsWithPagination = QueryParams & ProductSearchInput["pagination"];

@Controller({
  path: "products",
  version: "1",
})
export class ProductControllerV1 {
  private productUseCase: IProductUseCase;
  constructor() {
    const { productUseCase } = myProductFactory();
    this.productUseCase = productUseCase;
  }

  @UseGuards(UserGuard)
  @Post()
  create(@Body() data: CreateProductRequest, @GetUser() user: User) {
    return this.productUseCase.create({ data }, user.appUser);
  }

  @UseGuards(UserGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() data: UpdateProductRequest,
    @GetUser() user: User
  ) {
    return this.productUseCase.update({ data, searchBy: { id } }, user.appUser);
  }

  @UseGuards(UserGuard)
  @Delete()
  delete(@Param("id", ParseIntPipe) id: number, @GetUser() user: User) {
    return this.productUseCase.delete({ id }, user.appUser);
  }

  @UseGuards(AuthUserGuard)
  @Get(":id")
  async getOne(
    @Param("id", ParseIntPipe) id: number,
    @Query() query: QueryParams
  ) {
    const product = await this.productUseCase.getOneBy({
      searchBy: { id },
      options: {
        fetchBusiness: query?.fetchBusiness,
        fetchCategory: query?.fetchCategory,
        fetchPhotos: query?.fetchPhotos,
      },
    });
    if (!product) {
      throw new PresentationError("product not found", ErrorCode.NOT_FOUND);
    }
    return product;
  }

  @UseGuards(AuthUserGuard)
  @Get()
  getMany(@Query() query: QueryParamsWithPagination) {
    return this.productUseCase.getManyBy({
      searchBy: {
        id: query?.id,
        name: query?.name,
        description: query?.description,
        businessId: query?.businessId,
        categoryId: query?.categoryId,
      },
      options: {
        fetchBusiness: query?.fetchBusiness,
        fetchCategory: query?.fetchCategory,
        fetchPhotos: query?.fetchPhotos,
      },
      pagination: {
        limit: query?.limit,
        skip: query?.skip,
      },
    });
  }
}
