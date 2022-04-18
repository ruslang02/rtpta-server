import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray } from "class-validator";

export class PatchReport {
    @ApiProperty()
    @IsString({ message: "Report status should be a string." })
    @IsOptional()
        status: string;

    @ApiProperty()
    @IsString({ message: "Report type should be a string." })
    @IsOptional()
        type: string;

    @ApiProperty()
    @IsArray({ message: "Files field should be a list of file IDs." })
    @IsString({ each: true, message: "Report's file attachment IDs must be strings." })
        files: string[];
}
