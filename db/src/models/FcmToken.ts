import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserAuth } from "./UserAuth";

@Entity()
export class FcmToken {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserAuth)
    author: UserAuth;

    @Column()
    token: string; 
}
