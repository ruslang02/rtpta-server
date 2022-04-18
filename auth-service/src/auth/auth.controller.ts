import { Controller } from "@nestjs/common";
import {
    AuthController,
    AuthControllerMethods,
    AuthorizationResult,
    CheckTokenResult,
    CreateUserRequest,
    GetUserRequest,
    GetUsersRequest,
    InvalidateTokenResult,
    KeyCredentials,
    ManyUsersResponse,
    OneUserResponse,
    PasswordCredentials,
    PatchUserRequest,
    RegistrationDetails,
    RegistrationResult,
    ResetPasswordDetails,
    ResetPasswordRequest,
    ResetPasswordRequestResult,
    ResetPasswordResult,
    Token,
    TokenShort,
    ValidationDetails
} from "../proto/auth";
import { AuthService } from "./auth.service";
import { UserType } from "models/UserAuth";

@Controller()
@AuthControllerMethods()
export class AuthControllerImpl implements AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    async createUser(request: CreateUserRequest): Promise<OneUserResponse> {
        return this.authService.createUser(request);
    }

    async getUsers(request: GetUsersRequest): Promise<ManyUsersResponse> {
        return this.authService.getUsers(request);
    }

    async getUser(request: GetUserRequest): Promise<OneUserResponse> {
        return this.authService.getUser(request);
    }

    async patchUser(request: PatchUserRequest): Promise<OneUserResponse> {
        return this.authService.patchUser(request);
    }

    async validate(request: ValidationDetails): Promise<RegistrationResult> {
        return this.authService.validate(request.token);
    }

    async checkToken(request: TokenShort): Promise<CheckTokenResult> {
        return this.authService.checkToken(request.accessToken);
    }

    async register(request: RegistrationDetails): Promise<RegistrationResult> {
        return this.authService.register(request.email, request.password, request.type as UserType);
    }

    async authorizeViaPassword(request: PasswordCredentials): Promise<AuthorizationResult> {
        return this.authService.authorizeByPassword(request.email, request.password);
    }

    authorizeViaApiKey(request: KeyCredentials): Promise<AuthorizationResult> {
        throw new Error("Method not implemented.");
    }

    async invalidateToken(request: Token): Promise<InvalidateTokenResult> {
        return this.authService.invalidateToken(request.accessToken);
    }

    refreshToken(request: Token): Promise<AuthorizationResult> {
        return this.authService.refreshToken(request.accessToken, request.refreshToken);
    }

    sendResetPasswordEmail(request: ResetPasswordRequest): Promise<ResetPasswordRequestResult> {
        return this.authService.sendResetPasswordEmail(request.email);
    }

    resetPassword(request: ResetPasswordDetails): Promise<ResetPasswordResult> {
        return this.authService.resetPassword(request.email, request.password, request.token);
    }
}
