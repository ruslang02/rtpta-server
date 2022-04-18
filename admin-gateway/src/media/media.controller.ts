import { BadRequestException, Body, Controller, Get, Inject, OnModuleInit, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { map } from "rxjs";
import { AuthGuard } from "auth/auth.guard";
import { RequestWithAuth } from "auth/Request";
import { GenerateUploadRequestDto } from "dto/generate-upload-request.dto";
import { FileController } from "proto/file";

@ApiTags("Media")
@Controller({ path: "media", version: "1" })
export class MediaHttpController implements OnModuleInit {
    private mediaService: FileController;

    constructor(@Inject("FILE_SERVICE") private client: ClientGrpc) {}

    onModuleInit() {
        this.mediaService = this.client.getService<FileController>("File");
    }

    @Post("upload")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Generates a temporary link for file upload." })
    @ApiBody({ type: GenerateUploadRequestDto })
    generateUploadUrl(@Body() body: GenerateUploadRequestDto, @Request() request: RequestWithAuth) {
        return this.mediaService.generateUploadUrl({
            auth: request.auth,
            name: body.name,
            acl: { creator: [request.auth.uid], watchers: [request.auth.uid, "moderator", "administrator", ...body.aclWatchers] }
        }).pipe(
            map(result => {
                if (result.message) {
                    throw new BadRequestException(result.message);
                }
                return { id: result.id, url: result.url, expiresIn: result.expiresIn };
            })
        );
    }

    @Get("download/:id")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Generates a temporary link for file download." })
    generateDownloadUrl(@Param("id") id: string, @Request() request: RequestWithAuth) {
        return this.mediaService.generateDownloadUrl({
            auth: request.auth,
            id,
        }).pipe(
            map(result => {
                if (result.message) {
                    throw new BadRequestException(result.message);
                }
                return { url: result.url };
            })
        );
    }
}
