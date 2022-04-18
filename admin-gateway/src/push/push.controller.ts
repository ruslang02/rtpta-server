import { Body, Controller, Inject, OnModuleInit, Post, Request, UseGuards } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "auth/auth.guard";
import { RequestWithAuth } from "auth/Request";
import { RegisterDeviceDto } from "dto/register-device.dto";
import { PushController } from "proto/push";

@ApiTags("Push")
@Controller({ path: "push", version: "1" })
export class PushHttpController implements OnModuleInit {
    private pushService: PushController;

    constructor(@Inject("PUSH_SERVICE") private client: ClientGrpc) {}

    onModuleInit() {
        this.pushService = this.client.getService<PushController>("Push");
    }

    @Post("register")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Registers a new device for notifications." })
    @ApiBody({ type: RegisterDeviceDto })
    async registerDevice(@Body() body: RegisterDeviceDto, @Request() request: RequestWithAuth) {
        await this.pushService.registerDevice({ auth: request.auth, token: body.token });
    }

    @Post("test")
    @UseGuards(AuthGuard)
    @ApiOperation({ description: "Tests push-notifications on a user's device." })
    async testDevice(@Request() request: RequestWithAuth) {
        await this.pushService.sendNotification({
            recipient: request.auth.uid,
            title: "Your trip starts in 15 minutes!",
            body: "Your ticket №440 Kryukovo-Solnechnogorsk will be leaving from Bus Station Korpus #1501"
        });
    }
}
