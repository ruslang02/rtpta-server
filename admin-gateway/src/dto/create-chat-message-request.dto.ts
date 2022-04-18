import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateChatMessageRequestDto {
    @ApiProperty()
    @IsString({ message: "Message's text content should be set." })
    @IsNotEmpty({ message: "Message cannot be empty." })
        content: string;

    @ApiProperty()
    @IsArray({ message: "Files field should be a list of file IDs." })
    @IsString({ each: true, message: "Message's file attachment IDs must be strings." })
        files: string[];
}
