import { Request } from 'restify';

export interface IRequest<B = void, P = void, C = string> extends Request {
  body: B;
  params: P;
  get: (contextService: C) => C;
  set: (contextService: C, value: C) => C;
}
