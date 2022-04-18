import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { MailService } from "./mail.service";
import { MailControllerImpl } from "./mail.controller";

const { MAIL_TRANSPORT_URI, } = process.env;

@Module({
    imports: [
        MailerModule.forRoot({
            transport: MAIL_TRANSPORT_URI,
            defaults: { from: "\"nest-modules\" <modules@nestjs.com>", }
        })
    ],
    providers: [MailService],
    controllers: [MailControllerImpl]
})
export class MailModule {}
