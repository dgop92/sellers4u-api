import { ErrorCode, PresentationError } from "@common/errors";
import { User } from "@features/auth/entities/user";
import { GetUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { UserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import { myBusinessFactory } from "@features/business/factories/business.factory";
import { IBusinessUseCase } from "@features/business/ports/business.use-case.definition";
import {
  BusinessCreateInput,
  BusinessSearchInput,
  BusinessUpdateInput,
} from "@features/business/schema-types";
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Patch,
  Delete,
  Query,
} from "@nestjs/common";

type CreateBusinessRequest = BusinessCreateInput["data"];
type UpdateBusinessRequest = BusinessUpdateInput["data"];

type QueryParams = BusinessSearchInput["searchBy"] &
  BusinessSearchInput["options"];
type QueryParamsWithPagination = QueryParams &
  BusinessSearchInput["pagination"];

@Controller({
  path: "business",
  version: "1",
})
export class BusinessControllerV1 {
  private businessUseCase: IBusinessUseCase;
  constructor() {
    const { businessUseCase } = myBusinessFactory();
    this.businessUseCase = businessUseCase;
  }

  @UseGuards(UserGuard)
  @Post()
  create(@Body() data: CreateBusinessRequest, @GetUser() user: User) {
    return this.businessUseCase.create({ data }, user.appUser);
  }

  @UseGuards(UserGuard)
  @Get()
  getMany(@Query() query: QueryParamsWithPagination) {
    return this.businessUseCase.getManyBy({
      searchBy: { id: query?.id, name: query?.name },
      pagination: { limit: query?.limit, skip: query?.skip },
      options: { fetchOwner: query?.fetchOwner },
    });
  }

  @UseGuards(UserGuard)
  @Get("/own")
  async getOwn(
    @GetUser() user: User,
    @Query() query: BusinessSearchInput["options"]
  ) {
    console.log(query);
    const business = await this.businessUseCase.getOneBy({
      searchBy: { appUserId: user.appUser.id },
      options: { fetchOwner: query?.fetchOwner },
    });
    if (!business) {
      throw new PresentationError("business not found", ErrorCode.NOT_FOUND);
    }
    return business;
  }

  @UseGuards(UserGuard)
  @Patch()
  update(@Body() data: UpdateBusinessRequest, @GetUser() user: User) {
    return this.businessUseCase.update({ data }, user.appUser);
  }

  @UseGuards(UserGuard)
  @Delete()
  delete(@GetUser() user: User) {
    return this.businessUseCase.delete(user.appUser);
  }
}
