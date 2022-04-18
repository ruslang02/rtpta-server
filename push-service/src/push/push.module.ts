import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PushControllerImpl } from "./push.controller";
import { PushService } from "./push.service";
import { UserAuth } from "models/UserAuth";
import { FcmToken } from "models/FcmToken";

@Module({
    imports: [
        TypeOrmModule.forFeature([FcmToken, UserAuth])
    ],
    controllers: [PushControllerImpl],
    providers: [PushService]
})
export class PushModule {}
