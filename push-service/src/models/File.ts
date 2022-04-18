import { Entity, Column, PrimaryColumn } from "typeorm";

export type FileAcl = {
    creator: string[]
    watchers: string[]
};

export enum FileType {
    OTHER = "other",
    IMAGE = "image",
}

@Entity()
export class File {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    name: string;

    @Column({ enum: FileType })
    type: FileType;

    @Column("jsonb")
    acl: FileAcl;

    @Column()
    expired: boolean;

    @Column()
    available: boolean;
}
