import { SetMetadata } from "@nestjs/common";
import { UserType } from "./user.guard";

export const Types = (...types: UserType[]) => SetMetadata("types", types);
