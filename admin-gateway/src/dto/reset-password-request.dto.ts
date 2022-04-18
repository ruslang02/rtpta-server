import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ResetPasswordRequest {
    @ApiProperty()
    @IsEmail({ message: "User's email should be an email." })
    @IsNotEmpty({ message: "User's email cannot be empty." })
        email: string;
}
