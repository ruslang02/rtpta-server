import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClientGrpc } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcrypt";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Observable } from "rxjs";
import { EntityNotFoundError, Like, QueryFailedError, Repository } from "typeorm";
import { SnowflakeService } from "./snowflake.service";
import { InvalidToken } from "models/InvalidToken";
import { UserAuth, UserType } from "models/UserAuth";
import { AuthorizationResult, CheckTokenResult, CreateUserRequest, GetUserRequest, GetUsersRequest, InvalidateTokenResult, ManyUsersResponse, OneUserResponse, PatchUserRequest, RegistrationResult, ResetPasswordRequestResult, ResetPasswordResult, ResultCode } from "proto/auth";
import { EmailResponse, MailController } from "proto/mail";
@Injectable()
export class AuthService implements OnModuleInit {
    private mailService: MailController;

    onModuleInit() {
        this.mailService = this.client.getService<MailController>("Mail");
    }

    constructor(
        @InjectRepository(UserAuth)
        private usersRepository: Repository<UserAuth>,
        @InjectRepository(InvalidToken)
        private invalidTokenRepository: Repository<InvalidToken>,
        private snowflakeService: SnowflakeService,
        private readonly jwtService: JwtService,
        @Inject("MAIL_SERVICE") private client: ClientGrpc
    ) { }

    async authorizeByPassword(email: string, password: string): Promise<AuthorizationResult> {
        try {
            if (!email.trim() || !password.trim())
                return {
                    message: "Both email and password must be specified.",
                    code: ResultCode.CREDENTIALS_INVALID,
                    token: undefined
                };
            const user = await this.usersRepository.findOneOrFail({ where: { email } });
            if (!user.active)
                return {
                    message: "Your account is suspended. Please contact support for more information.",
                    code: ResultCode.CREDENTIALS_INVALID,
                    token: undefined
                };
            const match = await compare(password, user.password);
            if (match) {
                if (!user.validated)
                    return {
                        message: "Your account is not validated yet. Please check your mail inbox for a validation link.",
                        code: ResultCode.CREDENTIALS_INVALID,
                        token: undefined
                    };
                return {
                    code: ResultCode.SUCCESS,
                    message: "OK.",
                    token: {
                        accessToken: await this.jwtService.signAsync({ uid: user.id }, { expiresIn: "1h" }),
                        refreshToken: await this.jwtService.signAsync(this.snowflakeService.make()),
                        expiresAt: 3600
                    }
                };
            }
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return {
                    code: ResultCode.CREDENTIALS_INVALID,
                    message: "Username or password incorrect.",
                    token: undefined
                };
            }
            throw e;
        }

        return {
            code: ResultCode.CREDENTIALS_INVALID,
            message: "Username or password incorrect.",
            token: undefined
        };
    }

    async register(email: string, password: string, type: UserType): Promise<RegistrationResult> {
        if (![UserType.MANAGER, UserType.PASSENGER].includes(type))
            return {
                code: ResultCode.CREDENTIALS_INVALID,
                message: "You cannot register a user with this type."
            };

        try {
            const id = this.snowflakeService.make();
            await this.usersRepository.insert({
                id,
                email,
                password: await hash(password, 10),
                type,
            });
            const token = await this.jwtService.signAsync({ uid: id, action: "validate" });
            await (this.mailService.sendEmail({
                recipientEmail: email,
                recipientName: email,
                title: "Email validation",
                contents: `To validate your account, please proceed with this link: https://transport.infostrategic.com/validate.html?email=${email}&token=${token}`
            }) as Observable<EmailResponse>).toPromise();
            return {
                code: ResultCode.SUCCESS,
                message: "OK.",
            };
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return {
                    code: ResultCode.EMAIL_INVALID,
                    message: "Email is already registered, try signing in instead.",
                };
            }
            throw e;
        }
    }

    async invalidateToken(token: string): Promise<InvalidateTokenResult> {
        try {
            await this.jwtService.verify(token);
            await this.invalidTokenRepository.insert({
                token,
                invalidatedOn: new Date()
            });
            return {
                code: ResultCode.SUCCESS,
                message: "OK."
            };
        } catch (e) {
            if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
                return {
                    code: ResultCode.TOKEN_INVALID,
                    message: "Token is invalid or expired."
                };
            }
            if (e instanceof QueryFailedError) {
                return {
                    code: ResultCode.TOKEN_INVALID,
                    message: "Token was invalidated earlier."
                };
            }
            throw e;
        }
    }

    async refreshToken(accessToken: string, refreshToken: string): Promise<AuthorizationResult> {
        try {
            await this.invalidateToken(refreshToken);
            const uid = await this.jwtService.verifyAsync(accessToken);
            return {
                code: ResultCode.SUCCESS,
                message: "OK.",
                token: {
                    accessToken: await this.jwtService.signAsync({ uid }, { expiresIn: "1h" }),
                    refreshToken: await this.jwtService.signAsync(this.snowflakeService.make()),
                    expiresAt: 3600
                }
            };
        } catch (e) {
            if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
                return {
                    code: ResultCode.TOKEN_INVALID,
                    message: "Token is invalid or expired.",
                    token: undefined
                };
            }
            if (e instanceof QueryFailedError) {
                return {
                    code: ResultCode.TOKEN_INVALID,
                    message: "Token was invalidated earlier.",
                    token: undefined
                };
            }
            throw e;
        }
    }

    async sendResetPasswordEmail(email: string): Promise<ResetPasswordRequestResult> {
        try {
            const user = await this.usersRepository.findOneOrFail({ where: { email } });
            const token = await this.jwtService.signAsync(user.id);
            await (this.mailService.sendEmail({
                recipientEmail: email,
                recipientName: email,
                title: "Password Reset",
                contents: `To reset your email, please proceed with this link: https://transport.infostrategic.com/change_password.html?email=${email}&token=${token}`
            }) as Observable<EmailResponse>).toPromise();
            return {
                code: ResultCode.SUCCESS,
                message: "OK.",
            };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return {
                    code: ResultCode.EMAIL_INVALID,
                    message: "User with this email was not found.",
                };
            }
            throw e;
        }
    }

    async resetPassword(email: string, password: string, token: string): Promise<ResetPasswordResult> {
        try {
            const id = await this.jwtService.verifyAsync(token);
            await this.usersRepository.update({ id, email }, { password: await hash(password, 10) });
            return {
                code: ResultCode.SUCCESS,
                message: "OK.",
            };
        } catch (e) {
            if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
                return {
                    code: ResultCode.TOKEN_INVALID,
                    message: "Token is invalid or expired.",
                };
            }

            if (e instanceof EntityNotFoundError) {
                return {
                    code: ResultCode.EMAIL_INVALID,
                    message: "User was not found.",
                };
            }
            throw e;
        }
    }

    async checkToken(accessToken: string): Promise<CheckTokenResult> {
        try {
            const { uid }: { uid: string } = await this.jwtService.verifyAsync(accessToken);
            const auth = await this.usersRepository.findOneOrFail({ where: { id: uid } });

            return {
                auth: {
                    uid,
                    email: auth.email,
                    type: auth.type,
                    companyId: auth.companyId
                },
                isValid: true
            };
        } catch (e) {
            if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
                return { auth: undefined, isValid: false };
            }
            throw e;
        }
    }

    async validate(token: string): Promise<RegistrationResult> {
        try {
            const info = await this.jwtService.verifyAsync<{ uid: string; action: string }>(token);
            if (info.action !== "validate")
                return {
                    message: "This is not a validation URL.",
                    code: ResultCode.TOKEN_INVALID
                };

            await this.usersRepository.update({ id: info.uid }, { validated: true });
            return {
                message: "OK.",
                code: ResultCode.SUCCESS
            };
        } catch (e) {
            if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
                return {
                    message: "Validation URL is not valid.",
                    code: ResultCode.TOKEN_INVALID
                };
            }
            if (e instanceof EntityNotFoundError) {
                return {
                    message: "Validation URL is not valid.",
                    code: ResultCode.TOKEN_INVALID
                };
            }
            throw e;
        }
    }

    async patchUser(request: PatchUserRequest): Promise<OneUserResponse> {
        try {
            const { user, uid } = request;
            await this.usersRepository.update({ id: uid }, {
                ...user,
                type: user.type as UserType
            });
            const newUser = await this.usersRepository.findOneOrFail({ where: { id: uid } });
            return {
                message: "OK.",
                user: {
                    id: newUser.id,
                    active: newUser.active,
                    companyId: newUser.companyId,
                    email: newUser.email,
                    type: newUser.type,
                    validated: newUser.validated,
                }
            };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return {
                    message: "The user does not exist.",
                    user: undefined
                };
            }
            if (e instanceof QueryFailedError) {
                return {
                    message: "The update operation failed.",
                    user: undefined
                };
            }
            throw e;
        }
    }

    async getUser(request: GetUserRequest): Promise<OneUserResponse> {
        try {
            const user = await this.usersRepository.findOneOrFail({ where: { id: request.uid } });
            return {
                message: "OK.",
                user: {
                    id: user.id,
                    active: user.active,
                    companyId: user.companyId,
                    email: user.email,
                    type: user.type,
                    validated: user.validated,
                }
            };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return {
                    message: "The user does not exist.",
                    user: undefined
                };
            }
            throw e;
        }
    }

    async getUsers(request: GetUsersRequest): Promise<ManyUsersResponse> {
        try {
            const users = await this.usersRepository.find({ where: { email: Like(`%${request.query}%`) } });
            return {
                message: "OK.",
                users: users.map(user => ({
                    id: user.id,
                    active: user.active,
                    companyId: user.companyId,
                    email: user.email,
                    type: user.type,
                    validated: user.validated,
                }))
            };
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return {
                    message: "Could not get the list of users.",
                    users: []
                };
            }
            throw e;
        }
    }

    async createUser(request: CreateUserRequest): Promise<OneUserResponse> {
        try {
            const id = this.snowflakeService.make();
            const user = await this.usersRepository.save({
                id,
                email: request.email,
                password: await hash(request.password, 10),
                companyId: request.companyId,
                validated: true,
                type: request.type as UserType,
            });
            return {
                message: "OK.",
                user: {
                    id: user.id,
                    active: user.active,
                    companyId: user.companyId,
                    email: user.email,
                    type: user.type,
                    validated: user.validated,
                }
            };
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return {
                    message: "Could not create a user.",
                    user: undefined
                };
            }
            throw e;
        }
    }
}
