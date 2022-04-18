import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SupportService } from "./support.service";
import { Chat } from "models/Chat";
import { UserType } from "models/UserAuth";
import { ChatMessage } from "models/ChatMessage";
import { Report } from "models/Report";
import { File } from "models/File";

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<unknown>> = jest.fn(() => ({}));

const mockUser = { id: "0", email: "test@test.com", password: "s", type: UserType.MANAGER, companyId: null, active: true, validated: true };
const mockChat = { id: 0, participants: [mockUser], topic: "Refund" };

export const chatMockFactory: () => MockType<Repository<Chat>> = jest.fn(() => ({
    find: jest.fn(entity => (
        Promise.resolve([mockChat])
    ))
}));

describe("SupportService", () => {
    let service: SupportService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SupportService,
                { provide: getRepositoryToken(Chat), useFactory: chatMockFactory },
                { provide: getRepositoryToken(ChatMessage), useFactory: repositoryMockFactory },
                { provide: getRepositoryToken(File), useFactory: repositoryMockFactory },
                { provide: getRepositoryToken(Report), useFactory: repositoryMockFactory },
            ]
        }).compile();

        service = module.get<SupportService>(SupportService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should return chats", async () => {
        // @ts-ignore
        expect(await service.getChats({}))
            .toStrictEqual({ message: "", chats: [{ id: "0", participants: ["0"], topic: "Refund" }] });
    });
});
