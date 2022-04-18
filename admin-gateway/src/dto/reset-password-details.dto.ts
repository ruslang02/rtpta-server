import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDetails {
    @ApiProperty()
    @IsEmail({ message: "User's email should be an email." })
    @IsNotEmpty({ message: "User's email cannot be empty." })
        email: string;

    @ApiProperty()
    @IsString({ message: "Reset password token should be a string." })
    @IsNotEmpty({ message: "Reset password token cannot be empty." })
        token: string;

    @ApiProperty()
    @IsString({ message: "User's password should be set." })
    @IsNotEmpty({ message: "User's password cannot be empty." })
    @MinLength(8, { message: "User's password cannot be less than 8 symbols." })
        password: string;
}
