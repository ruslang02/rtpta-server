import { join } from "path";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PushHttpController } from "./push.controller";

@Module({
    controllers: [PushHttpController],
    imports: [
        ClientsModule.register([
            {
                name: "PUSH_SERVICE",
                transport: Transport.GRPC,
                options: {
                    package: "push",
                    protoPath: join(__dirname, "../../proto/push.proto"),
                    url: process.env.PUSH_SERVICE_URL
                },
            },
        ]),
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
        ]),
    ]
})
export class PushModule {}
