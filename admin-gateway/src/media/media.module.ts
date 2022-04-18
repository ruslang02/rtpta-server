import { join } from "path";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MediaHttpController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
    controllers: [MediaHttpController],
    imports: [
        ClientsModule.register([
            {
                name: "FILE_SERVICE",
                transport: Transport.GRPC,
                options: {
                    package: "file",
                    protoPath: join(__dirname, "../../proto/file.proto"),
                    url: process.env.FILE_SERVICE_URL
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
        ])
    ],
    providers: [MediaService]
})
export class MediaModule {}
