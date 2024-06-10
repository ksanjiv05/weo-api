import { Request as ExpressRequest } from "express";
export interface IRequest extends ExpressRequest {
  user?: any;
}

export interface Request extends ExpressRequest {
  user: any;
}
