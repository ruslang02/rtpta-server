import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDetailsDto {
    @ApiProperty()
    @IsNotEmpty({ message: "Account e-mail cannot be empty." })
    @IsEmail({}, { message: "Account e-mail must be an email." })
        email: string;

    @ApiProperty()
    @IsString({ message: "Account password is required." })
    @IsNotEmpty({ message: "Account password cannot be empty." })
        password: string;
}
