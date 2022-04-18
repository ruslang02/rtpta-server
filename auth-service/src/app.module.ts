import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";

const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USERNAME,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
} = process.env;

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forRoot({
            type: "postgres",
            host: POSTGRES_HOST,
            port: +POSTGRES_PORT,
            username: POSTGRES_USERNAME,
            password: POSTGRES_PASSWORD,
            database: POSTGRES_DB,
            autoLoadEntities: true,
        })
    ]
})
export class AppModule {}
