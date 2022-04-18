import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { FcmToken } from "models/FcmToken";
import { UserAuth } from "models/UserAuth";
import { DeviceOptions, Empty, NotificationOptions } from "proto/push";
const { FIREBASE_KEY } = process.env;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FCM = require("fcm-node");
@Injectable()
export class PushService {
    fcm = new FCM(FIREBASE_KEY);

    constructor(
        @InjectRepository(FcmToken)
        private tokenRepository: Repository<FcmToken>,
        @InjectRepository(UserAuth)
        private userRepository: Repository<UserAuth>
    ) { }

    async sendNotification(request: NotificationOptions): Promise<Empty> {
        const tokenInfo = await this.tokenRepository.findOne({ where: { authorId: request.recipient } });
        const message = {
            to: tokenInfo?.token ?? request.recipient,
            collapse_key: "rtpta",
            notification: {
                title: request.title,
                body: request.body
            }
        };
        await new Promise(resolve =>
            this.fcm.send(message, (err, response) => {
                console.log(err, response);
                resolve({});
            })
        );
        return {};
    }

    async registerDevice(request: DeviceOptions): Promise<Empty> {
        try {
            await this.tokenRepository.save({
                author: { id: request.auth.uid },
                token: request.token
            });
            return {};
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return {};
            }
            throw e;
        }
    }
}
