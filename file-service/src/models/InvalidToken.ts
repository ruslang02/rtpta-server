import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class InvalidToken {
    @PrimaryColumn({ unique: true })
    token: string;

    @Column()
    invalidatedOn: Date;
}
