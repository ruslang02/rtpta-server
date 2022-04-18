import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserAuth } from "./UserAuth";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    topic: string;

    @ManyToMany(() => UserAuth)
    @JoinTable()
    participants: UserAuth[];
}
