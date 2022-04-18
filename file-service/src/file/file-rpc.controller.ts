import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { FileService } from "./file.service";
import { FileController, GenerateDownloadUrlRequest, GenerateDownloadUrlResponse, GenerateUploadUrlRequest, GenerateUploadUrlResponse } from "proto/file";

@Controller()
export class FileRpcController implements FileController {
    constructor(private fileService: FileService) { }

    @GrpcMethod("File")
    generateUploadUrl(request: GenerateUploadUrlRequest): Promise<GenerateUploadUrlResponse> {
        return this.fileService.generateUploadUrl(request);
    }

    @GrpcMethod("File")
    generateDownloadUrl(request: GenerateDownloadUrlRequest): Promise<GenerateDownloadUrlResponse> {
        return this.fileService.generateDownloadUrl(request);
    }
}
