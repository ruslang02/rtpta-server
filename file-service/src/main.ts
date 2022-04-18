import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/rpc-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    const microservice = await app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            url: "0.0.0.0:5000",
            package: "file",
            protoPath: join(__dirname, "../proto/file.proto"),
        },
    });
    microservice.useGlobalFilters(new AllExceptionsFilter());

    await app.startAllMicroservices();

    await app.listen(process.env.PORT ? +process.env.PORT : 3000);
}
void bootstrap();
