import { BadRequestException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, Repository, QueryFailedError } from "typeorm";
import { JsonWebTokenError } from "jsonwebtoken";
import { MinioService } from "./minio.service";
import { SnowflakeService } from "./snowflake.service";
import { GenerateDownloadUrlRequest, GenerateDownloadUrlResponse, GenerateUploadUrlRequest, GenerateUploadUrlResponse } from "proto/file";
import { File, FileType } from "models/File";

const expiresIn = 10800;

@Injectable()
export class FileService implements OnModuleInit {
    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        private minioService: MinioService,
        private jwtService: JwtService,
        private snowflakeService: SnowflakeService
    ) { }

    async onModuleInit() {
        if (!await this.minioService.hasBucket("main")) {
            await this.minioService.createBucket("main");
        }
    }

    async generateUploadUrl(request: GenerateUploadUrlRequest): Promise<GenerateUploadUrlResponse> {
        try {
            const file = await this.fileRepository.save({
                id: this.snowflakeService.make(),
                name: request.name,
                type: FileType.OTHER,
                available: false,
                expired: false,
                acl: request.acl
            });
            const token = this.jwtService.sign({ uid: request.auth.uid }, { expiresIn });

            return {
                message: "",
                id: file.id,
                url: `https://transport.infostrategic.com/media/upload/${file.id}?token=${token}`,
                expiresIn
            };
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return {
                    message: "File could not be created.",
                    id: undefined,
                    url: undefined,
                    expiresIn: undefined
                };
            }
            throw e;
        }
    }

    async generateDownloadUrl(request: GenerateDownloadUrlRequest): Promise<GenerateDownloadUrlResponse> {
        try {
            const file = await this.fileRepository.findOneOrFail({ where: { id: request.id } });
            if (!file.acl.watchers.some(w => w.includes(request.auth.type)
                || w.includes(request.auth.uid)
                || (w.includes("manager:")
                    && typeof request.auth.companyId === "string"
                    && !!request.auth.companyId.trim()
                    && w.split(":")[1] === request.auth.companyId
                )
            )) return {
                message: "File with this ID was not found or you have no rights to view it.",
                url: undefined
            };
            const token = this.jwtService.sign({ uid: request.auth.uid }, { expiresIn });
            return { message: "", url: `https://transport.infostrategic.com/media/download/${file.id}/${file.name}?token=${token}`, };
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return {
                    message: "File with this ID was not found or you have no rights to view it.",
                    url: undefined
                };
            }
            throw e;
        }
    }

    async uploadFile(id: string, token: string, buffer: Buffer) {
        try {
            const { uid } = this.jwtService.verify<{ uid: string }>(token);
            const file = await this.fileRepository.findOneOrFail({ where: { id } });
            if (!file.acl.creator.includes(uid)) {
                throw new NotFoundException();
            }
            if (file.expired || file.available) {
                throw new NotFoundException();
            }
            await this.minioService.uploadToBucket("main", id, buffer);
            await this.fileRepository.update({ id }, { available: true });

            return { id };
        } catch (e) {
            if (e instanceof JsonWebTokenError) {
                throw new UnauthorizedException("Token is invalid.");
            }
            if (e instanceof EntityNotFoundError) {
                throw new NotFoundException();
            }
            throw e;
        }
    }

    async getFile(id: string, token: string) {
        try {
            const { uid } = this.jwtService.verify<{ uid: string }>(token);
            const file = await this.fileRepository.findOneOrFail({ where: { id } });
            if (!file.acl.watchers.includes(uid)) {
                throw new NotFoundException();
            }
            if (!file.available) {
                throw new NotFoundException();
            }

            return await this.minioService.downloadFromBucket("main", id);
        } catch (e) {
            if (e instanceof JsonWebTokenError) {
                throw new UnauthorizedException("Token is invalid.");
            }
            if (e instanceof EntityNotFoundError) {
                throw new BadRequestException("Could not download the file with this ID.");
            }
            throw e;
        }
    }
}
