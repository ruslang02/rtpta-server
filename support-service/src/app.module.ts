import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupportModule } from "support/support.module";

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
            autoLoadEntities: true
        }),
        SupportModule
    ]
})
export class AppModule {}
