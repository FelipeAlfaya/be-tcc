import { inject, injectable } from 'tsyringe';
import { Logger } from './Logger';
import { Router } from './Router';
import { Shell } from './Shell';
import { Storage } from './Storage';
import * as app from 'restify';
import { env } from '@config/env';
import cors from 'restify-cors-middleware';
import { bodyParser, queryParser } from 'restify-plugins';
import helmet from 'helmet';
import NodeEnv from '@declarations/enums/NodeEnv';
import morgan from 'morgan';
import { Controller } from '@interfaces/Controller';

@injectable()
export class Server {
  private _app: app.Server;
  private _shell: Shell;
  private _storage: Storage;
  private _router: Router;
  private _logger: Logger;

  constructor(
    @inject(Shell) shell: Shell,
    @inject(Router) router: Router,
    @inject(Storage) storage: Storage,
    @inject(Logger) logger: Logger
  ) {
    this._shell = shell;
    this._router = router;
    this._storage = storage;
    this._logger = logger;
    this._app = app.createServer({
      name: env.app.name,
      version: env.app.version,
    });
  }

  public start(callback?: () => void): void {
    const corsOptions: cors.Options = {
      origins: [...env.cors.origins],
      allowHeaders: ['Authorization'],
      exposeHeaders: ['x-custom-header'],
      preflightMaxAge: env.cors.preflightMaxAge,
    };

    const _cors: cors.CorsMiddleware = cors(corsOptions);

    this._app.pre(_cors.preflight);
    this._app.pre(app.plugins.pre.context());
    this._app.use(_cors.actual);
    this._app.use(queryParser());
    this._app.use(bodyParser());
    this._app.use(helmet());

    if (env.nodeEnv === NodeEnv.Development) {
      this._app.use(morgan('dev'));
    }

    this._app.listen(env.port, callback);
  }

  public control(controller: Controller): void {
    this.router.configure(controller, this);
  }

  public close(callback?: () => void): void {
    this._app.close(callback);
  }

  get app(): app.Server {
    return this._app;
  }

  get shell(): Shell {
    return this._shell;
  }

  get router(): Router {
    return this._router;
  }

  get storage(): Storage {
    return this._storage;
  }

  get logger(): Logger {
    return this._logger;
  }
}
