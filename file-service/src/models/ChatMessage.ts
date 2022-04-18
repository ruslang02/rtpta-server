import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./Chat";
import { File } from "./File";
import { UserAuth } from "./UserAuth";

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserAuth)
    author: UserAuth;

    @ManyToOne(() => Chat)
    chat: Chat;

    @Column()
    content: string;

    @ManyToMany(() => File)
    @JoinTable()
    files: File[];
}
