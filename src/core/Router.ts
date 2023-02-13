import { env } from '@config/env';
import { Controller } from '@interfaces/Controller';
import { Route } from '@interfaces/Route';
import { errorHandler } from '@middlewares/errorHandler';
import { injectable } from 'tsyringe';
import { Server } from './Server';

@injectable()
export class Router {
  private instance(route: Route, server: Server): void {
    server.app[route.method](
      route.path,
      route.middlewares,
      async (req, res, next) => {
        try {
          await route.handler(req, res, next);
        } catch (e) {
          errorHandler(e, req, res);
        }
      }
    );

    server.logger.log(
      'info',
      `${env.logger.colors.white}Route${env.logger.colors.reset} ${
        route.method === 'get'
          ? env.logger.colors.green
          : route.method === 'post'
          ? env.logger.colors.blue
          : route.method === 'put'
          ? env.logger.colors.yellow
          : route.method === 'del'
          ? env.logger.colors.red
          : env.logger.colors.reset
      }${route.method.toUpperCase()}${env.logger.colors.reset} ${
        env.logger.colors.magenta
      }${route.path}${env.logger.colors.reset} ${env.logger.colors.white}added${
        env.logger.colors.reset
      }`
    );
  }

  public configure(controller: Controller, server: Server): void {
    controller.routes.map(route => {
      this.instance(route, server);
    });
  }
}
