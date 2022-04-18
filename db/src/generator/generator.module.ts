import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAuth } from "models/UserAuth";
import { GeneratorService } from "./generator.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserAuth]),
    ],
    providers: [GeneratorService],
})
export class GeneratorModule {}
