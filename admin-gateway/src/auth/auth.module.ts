import { join } from "path";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AuthHTTPController } from "./auth.controller";
import { UsersHttpController } from "./users/users.controller";
import { AuthGuard } from "auth/auth.guard";

@Module({
    controllers: [AuthHTTPController, UsersHttpController],
    providers: [AuthGuard],
    exports: [AuthGuard],
    imports: [
        ClientsModule.register([
            {
                name: "AUTH_SERVICE",
                transport: Transport.GRPC,
                options: {
                    package: "auth",
                    protoPath: join(__dirname, "../../proto/auth.proto"),
                    url: process.env.AUTH_SERVICE_URL
                },
            },
        ])
    ]
})
export class AuthModule {}
