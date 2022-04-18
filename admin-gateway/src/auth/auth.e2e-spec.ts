import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AuthModule } from "./auth.module";

describe("Auth", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ imports: [AuthModule], }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it("/api/v1/auth/POST login (empty)", () => {
        return request(app.getHttpServer())
            .post("/auth/login")
            .send({})
            .expect(401)
            .expect(response => response.body.message === "Both email and password must be specified.");
    });

    it("/api/v1/auth/POST login (no email)", () => {
        return request(app.getHttpServer())
            .post("/auth/login")
            .send({ password: "test" })
            .expect(401)
            .expect(response => response.body.message === "Both email and password must be specified.");
    });

    it("/api/v1/auth/POST login (no password)", () => {
        return request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: "test@test.com" })
            .expect(401)
            .expect(response => response.body.message === "Both email and password must be specified.");
    });

    it("/api/v1/auth/POST login (wrong credentials)", () => {
        return request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: "test@test.com", password: "test2" })
            .expect(401)
            .expect(response => response.body.message === "Username or password incorrect.");
    });

    it("/api/v1/auth/POST login (correct credentials)", () => {
        return request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: "test@test.com", password: "test" })
            .expect(201);
    });

    it("/api/v1/auth/POST login (invalid account)", () => {
        return request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: "invalid@test.com", password: "test" })
            .expect(401)
            .expect(response => response.body.message === "Your account is not validated yet. Please check your mail inbox for a validation link.");
    });

    it("/api/v1/auth/POST login (inactive account)", () => {
        return request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: "inactive@test.com", password: "test" })
            .expect(401)
            .expect(response => response.body.message === "Your account is suspended. Please contact support for more information.");
    });

    afterAll(async () => {
        await app.close();
    });
});
