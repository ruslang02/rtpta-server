import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HelpdeskModule } from "./helpdesk/helpdesk.module";
import { MediaModule } from "./media/media.module";
import { PushModule } from "./push/push.module";

@Module({ imports: [AuthModule, HelpdeskModule, MediaModule, PushModule], })
export class AppModule {}
