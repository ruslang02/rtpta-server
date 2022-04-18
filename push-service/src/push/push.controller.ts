import { Controller } from "@nestjs/common";
import { PushService } from "./push.service";
import { DeviceOptions, Empty, NotificationOptions, PushController, PushControllerMethods } from "proto/push";

@Controller("")
@PushControllerMethods()
export class PushControllerImpl implements PushController {
    constructor(
        private pushService: PushService,
    ) { }

    registerDevice(request: DeviceOptions): Promise<Empty> {
        return this.pushService.registerDevice(request);
    }

    sendNotification(request: NotificationOptions): Promise<Empty> {
        return this.pushService.sendNotification(request);
    }
}
