import { Readable } from "stream";
import { Injectable } from "@nestjs/common";
import * as Minio from "minio";

const {
    MINIO_ENDPOINT,
    MINIO_PORT,
    MINIO_SSL,
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY
} = process.env;

@Injectable()
export class MinioService {
    private client: Minio.Client;

    constructor() {
        this.client = new Minio.Client({
            endPoint: MINIO_ENDPOINT,
            port: +MINIO_PORT,
            accessKey: MINIO_ACCESS_KEY,
            secretKey: MINIO_SECRET_KEY,
            useSSL: (MINIO_SSL ?? "").trim().toLowerCase() === "true"
        });
    }

    createBucket(bucketName: string) {
        return new Promise<void>((resolve, reject) => {
            this.client.makeBucket(bucketName, "main", err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    hasBucket(bucketName: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.client.bucketExists(bucketName, (err, result) => {
                if (err || !result) return resolve(false);
                resolve(true);
            });
        });
    }

    uploadToBucket(bucketName: string, fileName: string, buffer: Buffer) {
        return new Promise<void>((resolve, reject) => {
            this.client.putObject(bucketName, fileName, buffer, err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    downloadFromBucket(bucketName: string, fileName: string) {
        return new Promise<Readable>((resolve, reject) => {
            this.client.getObject(bucketName, fileName, (err, buffer) => {
                if (err) return reject(err);
                resolve(buffer);
            });
        });
    }
}
