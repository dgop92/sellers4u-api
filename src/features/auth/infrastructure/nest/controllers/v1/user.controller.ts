import { User } from "@features/auth/entities/user";
import { myUserServiceFactory } from "@features/auth/factories/user-service-factory";
import {
  IUserServiceUseCase,
  UserServiceCreateInput,
} from "@features/auth/ports/user-service.use-case.definition";
import { Body, Controller, Post, Get, UseGuards } from "@nestjs/common";
import { GetUser } from "../../custom-decorators";
import { UserGuard } from "../../guards/users.guard";

type CreateUserRequest = UserServiceCreateInput["appUserData"] &
  UserServiceCreateInput["authUserData"];

@Controller({
  path: "users",
  version: "1",
})
export class UserControllerV1 {
  private readonly userServiceUseCase: IUserServiceUseCase;
  constructor() {
    const { userService } = myUserServiceFactory();
    this.userServiceUseCase = userService;
  }

  @Post()
  create(@Body() data: CreateUserRequest) {
    return this.userServiceUseCase.create({
      appUserData: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      authUserData: {
        email: data.email,
        password: data.password,
      },
    });
  }

  @UseGuards(UserGuard)
  @Get("/me")
  getMe(@GetUser() user: User) {
    return user;
  }
}
