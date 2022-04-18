import { Request } from "express";
import { AuthInformation } from "proto/auth";

export type RequestWithAuth = Request & { auth: AuthInformation };
