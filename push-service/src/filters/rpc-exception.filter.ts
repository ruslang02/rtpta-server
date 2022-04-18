import { Catch, ArgumentsHost } from "@nestjs/common";
import { BaseRpcExceptionFilter } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { ResultCode } from "proto/auth";

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        console.error(exception);
        const answer = new Observable(subscriber => {
            subscriber.next({
                code: ResultCode.UNKNOWN_ERROR,
                message: "Internal server error."
            });
            subscriber.complete();
        });
        return answer;
    }
}
