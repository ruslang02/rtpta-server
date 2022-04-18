import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class ValidateAccountRequestDto {
    @ApiProperty()
    @IsString({ message: "Validation token should be a string." })
    @IsNotEmpty({ message: "Validation token cannot be empty." })
        token: string;
}
