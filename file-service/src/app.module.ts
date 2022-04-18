import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileModule } from "./file/file.module";
import { File } from "./models/File";

const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USERNAME,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
} = process.env;

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: POSTGRES_HOST,
            port: +POSTGRES_PORT,
            username: POSTGRES_USERNAME,
            password: POSTGRES_PASSWORD,
            database: POSTGRES_DB,
            keepConnectionAlive: true,
            autoLoadEntities: true
        }),
        FileModule
    ],
})
export class AppModule {}
