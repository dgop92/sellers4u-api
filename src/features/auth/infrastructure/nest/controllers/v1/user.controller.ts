import { myUserServiceFactory } from "@features/auth/factories/user-service-factory";
import {
  IUserServiceUseCase,
  UserServiceCreateInput,
} from "@features/auth/ports/user-service.use-case.definition";
import { Body, Controller, Post } from "@nestjs/common";

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
}
