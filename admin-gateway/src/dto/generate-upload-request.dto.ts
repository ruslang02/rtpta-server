import { ApiProperty } from "@nestjs/swagger";
import { Contains, IsArray, IsNotEmpty, IsString } from "class-validator";

export class GenerateUploadRequestDto {
    @ApiProperty()
    @IsString({ message: "File name should be set." })
    @IsNotEmpty({ message: "File name cannot be empty." })
    @Contains(".", { message: "File name should contain an extension." })
        name: string;

    @ApiProperty()
    @IsArray({ message: "ACL watchers should be an array of user tags." })
    @IsString({ each: true, message: "ACL watcher should be a string." })
        aclWatchers: string[];
}
