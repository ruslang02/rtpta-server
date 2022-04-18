import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, In, QueryFailedError, Repository } from "typeorm";
import { BugReportDetails, Chat as RpcChat, ChatMessage as RpcChatMessage, CreateChatDetails, CreateChatMessageDetails, GetChatMessageDetails, GetChatMessagesDetails, GetReportsOptions, ManyChatMessagesResult, ManyChatsResult, ManyReportsResult, NewCompanyRequestOptions, OneChatMessageResult, OneReportResult, PatchReportDetails, Report as RpcReport, ReportDetails, Result } from "proto/support";
import { Chat } from "models/Chat";
import { ChatMessage } from "models/ChatMessage";
import { Report, ReportType } from "models/Report";
import { File } from "models/File";

@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(ChatMessage)
        private chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(Report)
        private reportRepository: Repository<Report>,
    ) { }

    transformChat(chat: Chat): RpcChat {
        return {
            id: chat.id.toString(),
            participants: chat.participants.map(participant => participant.id),
            topic: chat.topic
        };
    }

    transformChatMessage(message: ChatMessage): RpcChatMessage {
        return {
            id: message.id.toString(),
            authorId: message.author?.id,
            files: message.files?.map(file => file.id) ?? [],
            content: message.content
        };
    }

    transformReport(report: Report): RpcReport {
        return {
            id: report.id.toString(),
            files: report.files?.map(file => file.id) ?? [],
            status: report.status,
            authorId: report.author?.id,
            description: report.description,
            type: report.type
        };
    }

    async patchReport(request: PatchReportDetails): Promise<OneReportResult> {
        try {
            const report = await this.reportRepository.findOneOrFail({ where: { id: +request.id } });
            // const files = await this.fileRepository.find({ where: { id: In(request.files) } });
            await this.reportRepository.update({ id: +request.id }, {
                description: report.description
                + (request.type ? "\n\nИзменен тип заявки на " + request.type + "." : "")
                // + (request.files ? "\n\nДобавлены файлы: " + request.files.join(", ") + "." : "")
                + (request.status ? "\n\nИзменен статус на " + request.status + "." : ""),
                type: request.type as ReportType ?? report.type,
                // files: [...report.files ?? [], ...files],
                status: request.status ?? report.status
            });
            const newReport = await this.reportRepository.findOneOrFail({ where: { id: +request.id } });
            return { message: "", report: this.transformReport(newReport) };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return { message: "Report with this ID does not exist.", report: undefined };
            }
            if (e instanceof QueryFailedError) {
                console.error(e);
                return { message: "Something went wrong with saving your report.", report: undefined };
            }
            throw e;
        }
    }

    async sendReport(request: ReportDetails): Promise<Result> {
        try {
            await this.reportRepository.save({
                files: request.files?.map(id => ({ id })) ?? [],
                description: request.description + (request.tripId ? "\n\nID поездки: " + request.tripId : ""),
                type: request.tripId ? ReportType.TRIP : ReportType.OTHER,
                author: { id: request.auth.uid },
                status: "waiting"
            });
            return { message: "" };
        } catch (e) {
            if (e instanceof QueryFailedError) {
                console.error(e);
                return { message: "Something went wrong with saving your report.", };
            }
            throw e;
        }
    }

    async sendBugReport(request: BugReportDetails): Promise<Result> {
        try {
            await this.reportRepository.save({
                files: request.files?.map(id => ({ id })) ?? [],
                description: request.description,
                type: ReportType.BUG,
                author: { id: request.auth.uid },
                status: "waiting"
            });
            return { message: "" };
        } catch (e) {
            if (e instanceof QueryFailedError) {
                console.error(e);
                return { message: "Something went wrong with saving your report.", };
            }
            throw e;
        }
    }

    async createChat(request: CreateChatDetails): Promise<Result> {
        try {
            await this.chatRepository.save({
                participants: [{ id: request.auth.uid }],
                topic: request.topic
            });
            return { message: "" };
        } catch (e) {
            if (e instanceof QueryFailedError) {
                console.error(e);
                return { message: "Something went wrong with creating your chat.", };
            }
            throw e;
        }
    }

    async createChatMessage(chatId: number, request: CreateChatMessageDetails): Promise<OneChatMessageResult> {
        const isModerator = ["moderator", "administrator"].includes(request.auth.type);
        try {
            const chat = await this.chatRepository.findOneOrFail({ where: { id: request.chatId } });
            if (!chat.participants.some(p => p.id === request.auth.uid)) {
                if (!isModerator)
                    return { message: "The message was not found.", messageItem: undefined };
                await this.chatRepository.update(
                    { id: chat.id },
                    { participants: [...chat.participants, { id: request.auth.uid }] }
                );
            }
            const message = await this.chatMessageRepository.save({
                content: request.content,
                files: request.files?.map(id => ({ id })) ?? [],
                chat: { id: chatId },
                author: { id: request.auth.uid }
            });
            return { message: "", messageItem: this.transformChatMessage(message) };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return { message: "Chat could not found or you do not have access to it.", messageItem: undefined };
            }
            if (e instanceof QueryFailedError) {
                console.error(e);
                return { message: "Something went wrong with creating your chat.", messageItem: undefined };
            }
            throw e;
        }
    }

    async getChatMessage(request: GetChatMessageDetails): Promise<OneChatMessageResult> {
        const isModerator = ["moderator", "administrator"].includes(request.auth.type);
        try {
            const chat = await this.chatRepository.findOneOrFail({ where: { id: request.chatId } });
            if (!chat.participants.some(p => p.id === request.auth.uid) && !isModerator)
                return { message: "The message was not found.", messageItem: undefined };
            const message = await this.chatMessageRepository.findOneOrFail({ relations: ["author", "files"], where: { id: request.messageId } });
            return { message: "", messageItem: this.transformChatMessage(message) };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return { message: "The message was not found.", messageItem: undefined };
            }
            throw e;
        }
    }

    async getChatMessages(request: GetChatMessagesDetails): Promise<ManyChatMessagesResult> {
        const isModerator = ["moderator", "administrator"].includes(request.auth.type);
        try {
            const chat = await this.chatRepository.findOneOrFail({ where: { id: request.chatId } });
            if (!chat.participants.some(p => p.id === request.auth.uid) && !isModerator)
                return { message: "Chat could not found or you do not have access to it.", messageItems: undefined };
            const messageItems = await this.chatMessageRepository.find({ relations: ["author", "files"], take: 50, where: { chatId: request.chatId } });
            return { message: "", messageItems: messageItems.map(this.transformChatMessage) };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return { message: "Chat could not found or you do not have access to it.", messageItems: undefined };
            }
            throw e;
        }
    }

    async getReports(request: GetReportsOptions): Promise<ManyReportsResult> {
        const isModerator = ["moderator", "administrator"].includes(request.auth.type);
        try {
            const reports = await this.reportRepository.find({ relations: ["author", "files"] });
            return {
                message: "",
                reports: reports
                    .filter(c => isModerator ? true : c.author.id === request.auth.uid)
                    .filter(c => !!request.archived === (c.status === "archived"))
                    .map(this.transformReport)
            };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return { message: "The reports could not found.", reports: [] };
            }
            throw e;
        }
    }

    async getChats(request: GetReportsOptions): Promise<ManyChatsResult> {
        const isModerator = ["moderator", "administrator"].includes(request.auth.type);
        try {
            const chats = await this.chatRepository.find({ relations: ["participants"] });
            return {
                message: "",
                chats: chats
                    .filter(c => isModerator ? true : c.participants.some(p => p.id === request.auth.uid))
                    .map(this.transformChat) ?? [],
            };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return { message: "The chats could not found.", chats: [] };
            }
            throw e;
        }
    }

    async newCompanyRequest(request: NewCompanyRequestOptions): Promise<Result> {
        return Promise.resolve({ message: "This function was deleted." });
    }
}
