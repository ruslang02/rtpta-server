import { Injectable, OnModuleInit } from "@nestjs/common";
import { hash } from "bcrypt";
import { Connection } from "typeorm";
import { UserAuth, UserType } from "models/UserAuth";

const users: Partial<UserAuth>[] = [
    {
        id: "1000",
        email: "admin@admin.com",
        password: "admin",
        active: true,
        validated: true,
        type: UserType.ADMINISTRATOR,
        companyId: null,
    },
    {
        id: "1001",
        email: "moderator@moderator.com",
        password: "moderator",
        active: true,
        validated: true,
        type: UserType.MODERATOR,
        companyId: null,
    },
    {
        id: "1002",
        email: "manager@manager.com",
        password: "manager",
        active: true,
        validated: true,
        type: UserType.MANAGER,
        companyId: "0",
    },
    {
        id: "1003",
        email: "passenger@passenger.com",
        password: "passenger",
        active: true,
        validated: true,
        type: UserType.PASSENGER,
    },
    {
        id: "2000",
        email: "test@test.com",
        password: "test",
        active: true,
        validated: true,
        type: UserType.PASSENGER,
    },
    {
        id: "2001",
        email: "invalid@test.com",
        password: "test",
        active: true,
        validated: false,
        type: UserType.PASSENGER,
    },
    {
        id: "2002",
        email: "inactive@test.com",
        password: "test",
        active: false,
        validated: true,
        type: UserType.PASSENGER,
    },
];

@Injectable()
export class GeneratorService implements OnModuleInit {
    constructor(private connection: Connection) {}

    async onModuleInit() {
        console.log("Creating users...");
        await this.connection.transaction(async manager => {
            const repo = manager.getRepository(UserAuth);
            for (const user of users) {
                await repo.save({
                    ...user,
                    password: await hash(user.password, 10),
                })
                    .then(u => console.log(`Created fake user ${u.email}`))
                    .catch(console.warn);
            }
        }).catch(console.error);
    }
}
