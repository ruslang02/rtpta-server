import { join } from "path";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { HelpdeskHTTPController } from "./helpdesk.controller";
import { AuthModule } from "auth/auth.module";

@Module({
    controllers: [HelpdeskHTTPController],
    imports: [
        AuthModule,
        ClientsModule.register([
            {
                name: "HELPDESK_SERVICE",
                transport: Transport.GRPC,
                options: {
                    package: "support",
                    protoPath: join(__dirname, "../../proto/support.proto"),
                    url: process.env.HELPDESK_SERVICE_URL
                },
            },
            {
                name: "AUTH_SERVICE",
                transport: Transport.GRPC,
                options: {
                    package: "auth",
                    protoPath: join(__dirname, "../../proto/auth.proto"),
                    url: process.env.AUTH_SERVICE_URL
                },
            },
        ]),
    ]
})
export class HelpdeskModule {}
