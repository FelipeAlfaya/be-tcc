import ServerResponse from '@declarations/classes/Response';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Controller } from '@interfaces/Controller';
import { IRequest } from '@interfaces/Request';
import { Route } from '@interfaces/Route';
import { AuthService } from '@services/AuthService';
import { Response } from 'restify';
import { inject, injectable } from 'tsyringe';

@injectable()
export class AuthController implements Controller {
  service: AuthService;

  constructor(@inject(AuthService) service: AuthService) {
    this.service = service;
  }

  get routes(): Route[] {
    return [
      {
        path: '/auth',
        method: 'post',
        handler: this.login.bind(this),
        middlewares: [],
      },
    ];
  }

  public async login(
    req: IRequest<{ email: string; password: string }>,
    res: Response
  ): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(
        await this.service.login(req.body.email, req.body.password)
      )
    );
  }
}
