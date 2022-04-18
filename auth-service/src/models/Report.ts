import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { File } from "./File";
import { UserAuth } from "./UserAuth";

export enum ReportType {
    BUG = "BUG",
    TRIP = "TRIP",
    OTHER = "OTHER",
}

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: ReportType,
    })
    type: ReportType;

    @ManyToOne(() => UserAuth)
    author: UserAuth;

    @Column()
    description: string;

    @ManyToMany(() => File)
    @JoinTable()
    files: File[];
}
