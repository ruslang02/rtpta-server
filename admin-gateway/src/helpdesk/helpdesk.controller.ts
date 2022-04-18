import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, OnModuleInit, Param, Patch, Post, Put, Query, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { map } from "rxjs";
import { AuthGuard } from "auth/auth.guard";
import { RequestWithAuth } from "auth/Request";
import { CreateChatMessageRequestDto } from "dto/create-chat-message-request.dto";
import { CreateChatRequestDto } from "dto/create-chat-request.dto";
import { GetChatMessagesRequestDto } from "dto/get-chat-messages-request.dto";
import { SendReportRequest } from "dto/send-report-request.dto";
import { SupportController } from "proto/support";
import { PatchReport } from "dto/patch-report.dto";
import { Types } from "utils/type.decorator";

@ApiTags("Helpdesk")
@Controller({ path: "helpdesk", version: "1" })
export class HelpdeskHTTPController implements OnModuleInit {
    private supportService: SupportController;

    constructor(@Inject("HELPDESK_SERVICE") private client: ClientGrpc) {}

    onModuleInit() {
        this.supportService = this.client.getService<SupportController>("Support");
    }

    @Get("reports")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Retrieves a list of reports." })
    getReports(@Request() request: RequestWithAuth) {
        return this.supportService.getReports({ auth: request.auth, archived: false }).pipe(
            map(result => {
                if (result.message)
                    if (result.message.includes("not found"))
                        throw new NotFoundException(result.message);
                    else
                        throw new BadRequestException(result.message);
                return result.reports ?? [];
            })
        );
    }

    @Patch("reports/:id")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Retrieves a list of reports." })
    @ApiBody({ type: PatchReport })
    @Types("moderator", "administrator")
    patchReport(@Request() request: RequestWithAuth, @Param("id") reportId: string, @Body() body: PatchReport) {
        return this.supportService.patchReport({
            auth: request.auth,
            files: body.files,
            id: reportId,
            status: body.status,
            type: body.type
        }).pipe(
            map(result => {
                if (result.message)
                    if (result.message.includes("not found"))
                        throw new NotFoundException(result.message);
                    else
                        throw new BadRequestException(result.message);
                return result.report;
            })
        );
    }

    @Post("report")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Sends a report on a finished trip." })
    @ApiBody({ type: SendReportRequest })
    sendReport(@Body() body: SendReportRequest, @Request() request: RequestWithAuth) {
        return this.supportService.sendReport({
            description: body.description,
            tripId: body.tripId,
            files: body.files,
            auth: request.auth
        }).pipe(
            map(result => {
                if (result.message)
                    throw new UnauthorizedException(result.message);
                return { message: "OK." };
            })
        );
    }

    @Post("report_bugs")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Creates a bug report." })
    @ApiBody({ type: SendReportRequest })
    sendBugReport(@Body() body: SendReportRequest, @Request() request: RequestWithAuth) {
        return this.supportService.sendBugReport({
            description: body.description,
            files: body.files,
            auth: request.auth
        }).pipe(
            map(result => {
                if (result.message)
                    throw new UnauthorizedException(result.message);
                return { message: "OK." };
            })
        );
    }

    @Get("chats")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Retrieves a list of chats." })
    getChats(@Request() request: RequestWithAuth) {
        return this.supportService.getChats({ auth: request.auth, archived: false }).pipe(
            map(result => {
                if (result.message)
                    throw new BadRequestException(result.message);
                return result.chats ?? [];
            })
        );
    }

    @Post("chats")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Creates a new chat." })
    @ApiBody({ type: CreateChatRequestDto })
    @Types("passenger", "manager")
    createChat(@Body() body: CreateChatRequestDto, @Request() request: RequestWithAuth) {
        return this.supportService.createChat({
            auth: request.auth,
            topic: body.topic
        }).pipe(
            map(result => {
                if (result.message)
                    throw new BadRequestException(result.message);
                return { message: "OK." };
            })
        );
    }

    @Put("chats/:chat_id")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Creates a new chat message." })
    @ApiBody({ type: CreateChatMessageRequestDto })
    createChatMessage(@Param("chat_id") chatId: string, @Body() body: CreateChatMessageRequestDto, @Request() request: RequestWithAuth) {
        return this.supportService.createChatMessage({
            auth: request.auth,
            chatId,
            content: body.content,
            files: body.files
        }).pipe(
            map(result => {
                if (result.message)
                    if (result.message.includes("not found"))
                        throw new NotFoundException(result.message);
                    else
                        throw new BadRequestException(result.message);
                return result.messageItem;
            })
        );
    }

    @Get("chats/:chat_id")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Retrieves a list of chat messages." })
    @ApiBody({ type: GetChatMessagesRequestDto })
    getChatMessages(@Param("chat_id") chatId: string, @Body() body: GetChatMessagesRequestDto, @Request() request: RequestWithAuth) {
        return this.supportService.getChatMessages({
            auth: request.auth,
            chatId,
            lastMessageId: body.last_message_id
        }).pipe(
            map(result => {
                if (result.message)
                    if (result.message.includes("not found"))
                        throw new NotFoundException(result.message);
                    else
                        throw new BadRequestException(result.message);
                return result.messageItems ?? [];
            })
        );
    }

    @Get("chats/:chat_id/:message_id")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Retrieves a chat message by its id." })
    getChatMessage(@Param("chat_id") chatId: string, @Param("message_id") messageId: string, @Request() request: RequestWithAuth) {
        return this.supportService.getChatMessage({
            auth: request.auth,
            chatId,
            messageId,
        }).pipe(
            map(result => {
                if (result.message)
                    if (result.message.includes("not found"))
                        throw new NotFoundException(result.message);
                    else
                        throw new BadRequestException(result.message);
                return result.messageItem;
            })
        );
    }
}
