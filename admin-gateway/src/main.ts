import { VersioningType } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "utils/validator.pipe";
import { UserGuard } from "utils/user.guard";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.setGlobalPrefix("/api");
    app.enableVersioning({ type: VersioningType.URI, });
    app.useGlobalGuards(new UserGuard(new Reflector()));
    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle("Admin Gateway")
        .setDescription("The gateway for administration purposes.")
        .setVersion("0.1")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("/api/swagger-ui", app, document);
    await app.listen(process.env.PORT ? +process.env.PORT : 3000);
}
void bootstrap();
