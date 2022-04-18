import { BadRequestException, Body, Controller, Inject, OnModuleInit, Post, UnauthorizedException } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { map } from "rxjs";
import { LoginDetailsDto } from "dto/login-details.dto";
import { RegistrationDetailsDto } from "dto/registration-details.dto";
import { ResetPasswordDetails } from "dto/reset-password-details.dto";
import { ResetPasswordRequest } from "dto/reset-password-request.dto";
import { TokenDto } from "dto/token.dto";
import { ValidateAccountRequestDto } from "dto/validate-account-request.dto";
import { AuthController, ResultCode } from "proto/auth";

@ApiTags("Authorization")
@Controller({ path: "auth", version: "1" })
export class AuthHTTPController implements OnModuleInit {
    private authService: AuthController;

    constructor(@Inject("AUTH_SERVICE") private client: ClientGrpc) {}

    onModuleInit() {
        this.authService = this.client.getService<AuthController>("Auth");
    }

    @Post("login")
    @ApiOperation({ description: "Attempts to sign in the user using e-mail and password." })
    @ApiBody({ type: LoginDetailsDto })
    login(@Body() body: LoginDetailsDto) {
        return this.authService.authorizeViaPassword(body)
            .pipe(
                map(result => {
                    if (result.code !== ResultCode.SUCCESS)
                        throw new UnauthorizedException(result.message);
                    return {
                        message: result.message,
                        token: result.token
                    };
                })
            );
    }

    @Post("register")
    @ApiOperation({ description: "Registers a user using e-mail and password." })
    @ApiBody({ type: RegistrationDetailsDto })
    register(@Body() body: RegistrationDetailsDto) {
        return this.authService.register(body)
            .pipe(
                map(result => {
                    if (result.code !== ResultCode.SUCCESS)
                        throw new BadRequestException(result.message);
                    return { message: result.message };
                })
            );
    }

    @Post("validate")
    @ApiOperation({ description: "Validates a user using token provided in the e-mail." })
    @ApiBody({ type: ValidateAccountRequestDto })
    validate(@Body() body: ValidateAccountRequestDto) {
        return this.authService.validate(body)
            .pipe(
                map(result => {
                    if (result.code !== ResultCode.SUCCESS)
                        throw new BadRequestException(result.message);
                    return { message: result.message };
                })
            );
    }

    @Post("invalidate")
    @ApiOperation({ description: "Invalidates a token." })
    @ApiBody({ type: TokenDto })
    invalidate(@Body() body: TokenDto) {
        return this.authService.invalidateToken(body)
            .pipe(
                map(result => {
                    if (result.code !== ResultCode.SUCCESS)
                        throw new UnauthorizedException(result.message);
                    return { message: result.message };
                })
            );
    }

    @Post("check")
    @ApiOperation({ description: "Checks if the token is valid." })
    @ApiBody({ type: TokenDto })
    check(@Body() body: TokenDto) {
        return this.authService.checkToken(body)
            .pipe(
                map(result => {
                    if (!result.isValid)
                        throw new UnauthorizedException();
                    return { message: "OK." };
                })
            );
    }

    @Post("refresh")
    @ApiOperation({ description: "Attempts to refresh the token." })
    @ApiBody({ type: TokenDto })
    refresh(@Body() body: TokenDto) {
        return this.authService.refreshToken(body)
            .pipe(
                map(result => {
                    if (result.code !== ResultCode.SUCCESS)
                        throw new UnauthorizedException(result.message);
                    return { message: result.message };
                })
            );
    }

    @Post("send_reset")
    @ApiOperation({ description: "Sends a password reset email." })
    @ApiBody({ type: ResetPasswordRequest })
    sendReset(@Body() body: ResetPasswordRequest) {
        return this.authService.sendResetPasswordEmail(body)
            .pipe(
                map(result => {
                    if (result.code !== ResultCode.SUCCESS)
                        throw new BadRequestException(result.message);
                    return { message: result.message };
                })
            );
    }

    @Post("reset")
    @ApiOperation({ description: "Resets an account's password." })
    @ApiBody({ type: ResetPasswordDetails })
    reset(@Body() body: ResetPasswordDetails) {
        return this.authService.resetPassword(body)
            .pipe(
                map(result => {
                    if (result.code !== ResultCode.SUCCESS)
                        throw new BadRequestException(result.message);
                    return { message: result.message };
                })
            );
    }
}
