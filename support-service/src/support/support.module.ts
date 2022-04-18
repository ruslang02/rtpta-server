import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupportControllerImpl } from "./support.controller";
import { SupportService } from "./support.service";
import { Chat } from "models/Chat";
import { ChatMessage } from "models/ChatMessage";
import { Report } from "models/Report";
import { UserAuth } from "models/UserAuth";
import { File } from "models/File";

@Module({
    controllers: [SupportControllerImpl],
    imports: [
        TypeOrmModule.forFeature([Chat, ChatMessage, File, Report, UserAuth])
    ],
    providers: [SupportService]
})
export class SupportModule {}
