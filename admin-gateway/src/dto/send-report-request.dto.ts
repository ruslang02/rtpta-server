import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendReportRequest {
    @ApiProperty()
    @IsString({ message: "Report description should be a string." })
        description: string;

    @ApiProperty()
    @IsString({ message: "Report trip ID should be a string." })
    @IsNotEmpty({ message: "Report trip ID cannot be empty." })
    @IsOptional()
        tripId: string;

    @ApiProperty()
    @IsArray({ message: "Files field should be a list of file IDs." })
    @IsString({ each: true, message: "Report's file attachment IDs must be strings." })
        files: string[];
}
