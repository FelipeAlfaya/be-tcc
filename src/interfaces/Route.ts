import { RequestHandler } from 'restify';

export interface Route {
  method: 'get' | 'post' | 'put' | 'del';
  path: string;
  handler: RequestHandler;
  middlewares: RequestHandler[];
}
