import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class GetChatMessagesRequestDto {
    @ApiProperty()
    @IsString({ message: "Last message ID to select should be a string." })
    @IsOptional()
        last_message_id?: string;
}
