import { AuthUser } from "@features/auth/entities/auth-user";
import { User } from "@features/auth/entities/user";
import { Request } from "express";

export type AuthRequest = Request & { authUser: AuthUser };
export type UserRequest = Request & { user: User };
