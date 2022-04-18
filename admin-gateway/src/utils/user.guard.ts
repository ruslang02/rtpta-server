import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RequestWithAuth } from "../auth/Request";

export type UserType = "passenger" | "manager" | "moderator" | "administrator";

@Injectable()
export class UserGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const types = this.reflector.get<UserType[]>("types", context.getHandler());
        const {
            auth,
            params,
        } = context.switchToHttp().getRequest<RequestWithAuth>();

        if (params.uid === auth?.uid || !types || types.includes(auth?.type as UserType)) {
            return true;
        }

        throw new ForbiddenException(
            "You do not have enough permissions to perform this action."
        );
    }
}
