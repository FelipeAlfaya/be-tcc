import ServerResponse from '@declarations/classes/Response';
import RouteHandleError from '@declarations/classes/RouteHandleError';
import { Request, Response } from 'restify';

export const errorHandler = (e: Error, req: Request, res: Response) => {
  if (e instanceof RouteHandleError) {
    res.send(e.status, new ServerResponse(e));
  }
};
