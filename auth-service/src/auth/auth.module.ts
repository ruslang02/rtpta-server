import { join } from "path";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AuthControllerImpl } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SnowflakeService } from "./snowflake.service";
import { InvalidToken } from "models/InvalidToken";
import { UserAuth } from "models/UserAuth";

@Module({
    imports: [
        JwtModule.register({ secret: process.env.JWT_SECRET }),
        ClientsModule.register([
            {
                name: "MAIL_SERVICE",
                transport: Transport.GRPC,
                options: {
                    package: "mail",
                    protoPath: join(__dirname, "../../proto/mail.proto"),
                    url: process.env.MAIL_SERVICE_URL
                },
            },
        ]),
        TypeOrmModule.forFeature([UserAuth, InvalidToken])
    ],
    providers: [AuthService, SnowflakeService],
    controllers: [AuthControllerImpl]
})
export class AuthModule {}
