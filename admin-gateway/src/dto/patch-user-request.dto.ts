import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class PatchUserRequestDto {
    @ApiProperty()
    @IsEmail({ message: "User's email should be an email." })
    @IsOptional()
        email?: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: "User's password should be set." })
    @IsNotEmpty({ message: "User's password cannot be empty." })
    @MinLength(8, { message: "User's password cannot be less than 8 symbols." })
        password?: string;

    @ApiProperty()
    @IsOptional()
    @IsIn(["passenger", "manager", "moderator", "administrator"])
        type?: string;

    @ApiProperty()
    @IsString({ message: "Company ID should be a string." })
    @IsOptional()
        companyId?: string;

    @ApiProperty()
    @IsBoolean({ message: "Account active flag should be a boolean." })
    @IsOptional()
        active?: boolean;
}
