import { BadRequestException, Controller, Get, Param, Post, Query, Response, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response as ExpressResponse } from "express";
import { FileService } from "./file.service";

@Controller("media")
export class FileHttpController {
    constructor(private fileService: FileService) { }

    @Get("download/:id/:name")
    async getFile(@Param("id") id: string, @Query("token") token: string, @Response() response: ExpressResponse) {
        try {
            (await this.fileService.getFile(id, token)).pipe(response);
        } catch (e) {
            if (e instanceof Error) {
                throw new BadRequestException(e.message);
            }
            throw e;
        }
    }

    @Post("upload/:id")
    @UseInterceptors(FileInterceptor("file"))
    async putFile(@Param("id") id: string, @Query("token") token: string, @UploadedFile() file: Express.Multer.File) {
        try {
            return await this.fileService.uploadFile(id, token, file.buffer);
        } catch (e) {
            if (e instanceof Error) {
                throw new BadRequestException(e.message);
            }
            throw e;
        }
    }
}
