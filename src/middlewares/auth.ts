import { Server } from '@core/Server';
import RouteHandleError from '@declarations/classes/RouteHandleError';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { IRequest } from '@interfaces/Request';
import { Next, Response } from 'restify';
import { container } from 'tsyringe';
import { errorHandler } from './errorHandler';

export const auth = async (
  req: IRequest<void, void, string>,
  res: Response,
  next: Next
) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      throw new RouteHandleError(
        HttpStatusCodes.UNAUTHORIZED,
        'You must be logged in to access this route'
      );
    }

    if (!bearer.startsWith('Bearer')) {
      throw new RouteHandleError(HttpStatusCodes.UNAUTHORIZED, 'Invalid token');
    }

    const token = bearer.split(' ')[1];

    if (!token) {
      throw new RouteHandleError(HttpStatusCodes.UNAUTHORIZED, 'Invalid token');
    }

    const server: Server = container.resolve('server');

    const id = await server.shell
      .detokenify<{
        id: string;
      }>(token)
      .catch(e => {
        server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.UNAUTHORIZED,
          'Invalid token'
        );
      })
      .then(({ id }) => id);

    if (!id) {
      throw new RouteHandleError(HttpStatusCodes.UNAUTHORIZED, 'Invalid Token');
    }

    req.set('userId', id);
    next();
  } catch (e) {
    errorHandler(e, req, res);
  }
};
