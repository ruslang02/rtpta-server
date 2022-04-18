import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { SupportService } from "./support.service";
import { BugReportDetails, CreateChatDetails, CreateChatMessageDetails, GetChatMessageDetails, GetChatMessagesDetails, GetReportsOptions, ManyChatMessagesResult, ManyChatsResult, ManyReportsResult, NewCompanyRequestOptions, OneChatMessageResult, OneReportResult, PatchReportDetails, ReportDetails, Result, SupportController } from "proto/support";

@Controller()
export class SupportControllerImpl implements SupportController {
    constructor(private supportService: SupportService) { }

    @GrpcMethod("Support")
    getChats(request: GetReportsOptions): ManyChatsResult | Promise<ManyChatsResult> | Observable<ManyChatsResult> {
        return this.supportService.getChats(request);
    }

    @GrpcMethod("Support")
    sendReport(request: ReportDetails): Result | Promise<Result> | Observable<Result> {
        return this.supportService.sendReport(request);
    }

    @GrpcMethod("Support")
    sendBugReport(request: BugReportDetails): Result | Promise<Result> | Observable<Result> {
        return this.supportService.sendBugReport(request);
    }

    @GrpcMethod("Support")
    createChat(request: CreateChatDetails): Result | Promise<Result> | Observable<Result> {
        return this.supportService.createChat(request);
    }

    @GrpcMethod("Support")
    getChatMessage(request: GetChatMessageDetails): Promise<OneChatMessageResult> {
        return this.supportService.getChatMessage(request);
    }

    @GrpcMethod("Support")
    getChatMessages(request: GetChatMessagesDetails): Promise<ManyChatMessagesResult> {
        return this.supportService.getChatMessages(request);
    }

    @GrpcMethod("Support")
    createChatMessage(request: CreateChatMessageDetails): Promise<OneChatMessageResult> {
        return this.supportService.createChatMessage(+request.chatId, request);
    }

    @GrpcMethod("Support")
    getReports(request: GetReportsOptions): Promise<ManyReportsResult> {
        return this.supportService.getReports(request);
    }

    @GrpcMethod("Support")
    newCompanyRequest(request: NewCompanyRequestOptions): Promise<Result> {
        return this.supportService.newCompanyRequest(request);
    }

    @GrpcMethod("Support")
    patchReport(request: PatchReportDetails): Promise<OneReportResult> {
        return this.supportService.patchReport(request);
    }
}
