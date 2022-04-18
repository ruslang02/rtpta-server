import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PushModule } from "./push/push.module";

@Module({
    imports: [
        PushModule,
        TypeOrmModule.forRoot()
    ],
})
export class AppModule {}
