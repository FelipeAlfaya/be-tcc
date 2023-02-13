import ServerResponse from '@declarations/classes/Response';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Controller } from '@interfaces/Controller';
import { IRequest } from '@interfaces/Request';
import { Route } from '@interfaces/Route';
import { auth } from '@middlewares/auth';
import { LogService } from '@services/LogService';
import { Response } from 'restify';
import { inject, injectable } from 'tsyringe';

@injectable()
export class LogController implements Controller {
  service: LogService;

  get routes(): Route[] {
    return [
      {
        method: 'get',
        path: '/logs',
        handler: this.list.bind(this),
        middlewares: [auth.bind(this)],
      },
      {
        method: 'post',
        path: '/logs',
        handler: this.log.bind(this),
        middlewares: [auth.bind(this)],
      },
    ];
  }

  constructor(@inject(LogService) service: LogService) {
    this.service = service;
  }

  public async list(
    req: IRequest<{ teamId: string }>,
    res: Response
  ): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(
        await this.service.list(req.body.teamId, req.query.userId)
      )
    );
  }

  public async log(
    req: IRequest<{ entry: string; teamId: string }>,
    res: Response
  ): Promise<void> {
    res.send(
      HttpStatusCodes.CREATED,
      new ServerResponse(
        await this.service.log(req.body.entry, req.body.teamId, req.get('id'))
      )
    );
  }
}
