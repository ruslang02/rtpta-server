import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegistrationDetailsDto {
    @ApiProperty()
    @IsEmail({ message: "User's email should be an email." })
    @IsNotEmpty({ message: "User's email cannot be empty." })
        email: string;

    @ApiProperty()
    @IsString({ message: "User's password should be set." })
    @IsNotEmpty({ message: "User's password cannot be empty." })
    @MinLength(8, { message: "User's password cannot be less than 8 symbols." })
        password: string;

    @ApiProperty()
    @IsIn(["passenger", "manager"])
        type: "manager" | "passenger";
}
