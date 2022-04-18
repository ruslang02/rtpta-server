
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { map, Observable } from "rxjs";
import { AuthController } from "proto/auth";

@Injectable()
export class AuthGuard implements CanActivate {
    private authService: AuthController;

    constructor(@Inject("AUTH_SERVICE") private client: ClientGrpc) {}

    onModuleInit() {
        this.authService = this.client.getService<AuthController>("Auth");
    }

    canActivate(
        context: ExecutionContext,
    ): Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authStr: string = request.headers.Authorization || request.headers.authorization;
        if (!authStr) throw new UnauthorizedException();
        const accessToken = authStr.replace("Bearer ", "");
        return this.authService.checkToken({ accessToken })
            .pipe(
                map(answer => {
                    if (answer.isValid) {
                        request.auth = answer.auth;
                        return true;
                    }
                    throw new UnauthorizedException();
                })
            );
    }
}
