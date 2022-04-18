import { Controller, OnModuleInit } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { GrpcMethod } from "@nestjs/microservices";
import { EmailOptions, EmailResponse, MailController } from "proto/mail";

@Controller()
export class MailControllerImpl implements MailController, OnModuleInit {
    constructor(private readonly mailerService: MailerService) { }

    onModuleInit() {
        console.log("initalized", this.mailerService);
    }

    @GrpcMethod("Mail")
    async sendEmail(request: EmailOptions): Promise<EmailResponse> {
        await this.mailerService
            .sendMail({
                to: request.recipientEmail, // list of receivers
                from: "ISTransport@yandex.ru", // sender address
                subject: request.title, // plaintext body
                html: request.contents, // HTML body content
            });
        return {};
    }
}
