import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateChatRequestDto {
    @ApiProperty()
    @IsString({ message: "The topic should be set." })
    @IsNotEmpty({ message: "The topic cannot be empty." })
        topic: string;
}
