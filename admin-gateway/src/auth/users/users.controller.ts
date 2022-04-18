import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, NotFoundException, Param, Patch, Put, Query, Request, UseGuards } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { map } from "rxjs";
import { AuthGuard } from "../auth.guard";
import { RequestWithAuth } from "../Request";
import { CreateUserRequestDto } from "dto/create-user-request.dto";
import { PatchUserRequestDto } from "dto/patch-user-request.dto";
import { AuthController } from "proto/auth";
import { Types } from "utils/type.decorator";
import { UserGuard } from "utils/user.guard";

@ApiTags("Users")
@Controller({ path: "users", version: "1" })
export class UsersHttpController {
    private authService: AuthController;

    constructor(@Inject("AUTH_SERVICE") private client: ClientGrpc) {}

    onModuleInit() {
        this.authService = this.client.getService<AuthController>("Auth");
    }

    @Get("current")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Returns current user's data." })
    @ApiBearerAuth()
    current(@Request() request: RequestWithAuth) {
        return {
            id: request.auth.uid,
            email: request.auth.email,
            type: request.auth.type,
            companyId: request.auth.companyId ?? null
        };
    }

    @Put("")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Creates a user." })
    @ApiBearerAuth()
    @ApiBody({ type: CreateUserRequestDto })
    @Types("administrator")
    createUser(@Body() body: CreateUserRequestDto, @Request() request: RequestWithAuth) {
        return this.authService.createUser({
            ...body,
            auth: request.auth,
            companyId: body.companyId
        }).pipe(map(v => {
            if (!v.user) throw new BadRequestException(v.message);
            return v.user;
        }));
    }

    @Get("")
    @UseGuards(AuthGuard, UserGuard)
    @ApiOperation({ description: "Searches users using a string query." })
    @ApiBearerAuth()
    @ApiBody({ type: CreateUserRequestDto })
    @Types("moderator", "administrator")
    getUsers(@Query("q") query: string, @Request() request: RequestWithAuth) {
        return this.authService.getUsers({
            auth: request.auth,
            query,
        }).pipe(map(v => {
            if (!v.users.length && v.message.length > 3) throw new BadRequestException(v.message);
            return v.users;
        }));
    }

    @Get(":id")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Searches users using a string query." })
    @ApiBearerAuth()
    @ApiBody({ type: CreateUserRequestDto })
    getUser(@Param("id") uid: string, @Request() request: RequestWithAuth) {
        return this.authService.getUser({
            auth: request.auth,
            uid,
            email: undefined
        }).pipe(map(v => {
            if (!v.user) throw new NotFoundException(v.message);
            return v.user;
        }));
    }

    @Patch(":id")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Patches user auth data." })
    @ApiBearerAuth()
    @ApiBody({ type: PatchUserRequestDto })
    patchUser(@Param("id") uid: string, @Body() body: PatchUserRequestDto, @Request() request: RequestWithAuth) {
        if (
            !["moderator", "administator"].includes(request.auth.type)
            && (request.auth.uid !== uid
                || "active" in body
                || "email" in body
                || "type" in body
                || "validated" in body
                || "companyId" in body)
        ) {
            throw new ForbiddenException("You are not permitted to perform this operation.");
        }
        return this.authService.patchUser({
            auth: request.auth,
            uid,
            user: {
                active: body.active,
                companyId: body.companyId,
                email: body.email,
                password: body.password,
                type: body.type,
            }
        }).pipe(map(v => {
            if (!v.user) throw new NotFoundException(v.message);
            return v.user;
        }));
    }

}
