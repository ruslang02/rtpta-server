import { Column, Entity, PrimaryColumn } from "typeorm";

export enum UserType {
    MANAGER = "manager",
    PASSENGER = "passenger",
    MODERATOR = "moderator",
    ADMINISTRATOR = "administrator",
}
@Entity()
export class UserAuth {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ enum: UserType })
    type: UserType;

    @Column({ default: null })
    companyId: string | null;

    @Column()
    password: string;

    @Column({ default: true })
    active: boolean;

    @Column({ default: false })
    validated: boolean;
}
