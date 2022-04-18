import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import * as multer from "multer";
import { JwtModule } from "@nestjs/jwt";
import { FileService } from "./file.service";
import { FileRpcController } from "./file-rpc.controller";
import { FileHttpController } from "./file-http.controller";
import { SnowflakeService } from "./snowflake.service";
import { MinioService } from "./minio.service";
import { File } from "models/File";

@Module({
    providers: [FileService, SnowflakeService, MinioService],
    imports: [
        MulterModule.register({ storage: multer.memoryStorage() }),
        TypeOrmModule.forFeature([File]),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
    ],
    controllers: [FileRpcController, FileHttpController]
})
export class FileModule {}
