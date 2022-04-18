import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class RegisterDeviceDto {
    @ApiProperty()
    @IsBoolean({ message: "FCM device token should be a string." })
        token: string;
}
