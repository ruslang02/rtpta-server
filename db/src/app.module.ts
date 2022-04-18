import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GeneratorModule } from "./generator/generator.module";

@Module({
    imports: [
        TypeOrmModule.forRoot(),
        GeneratorModule,
    ],
})
export class AppModule {}
