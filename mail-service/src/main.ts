import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/rpc-exception.filter";

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: "0.0.0.0:5000",
            package: "mail",
            protoPath: join(__dirname, "../proto/mail.proto"),
        },
    });
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.listen();
}
void bootstrap();
