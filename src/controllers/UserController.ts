import ServerResponse from '@declarations/classes/Response';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Controller } from '@interfaces/Controller';
import { IRequest } from '@interfaces/Request';
import { Route } from '@interfaces/Route';
import { auth } from '@middlewares/auth';
import { User } from '@models/User';
import { UserService } from '@services/UserService';
import { Response } from 'restify';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UserController implements Controller {
  public service: UserService;

  constructor(@inject(UserService) service: UserService) {
    this.service = service;
  }

  get routes(): Route[] {
    return [
      {
        path: '/user',
        method: 'get',
        handler: this.getUserInfo.bind(this),
        middlewares: [auth.bind(this)],
      },
      {
        path: '/user',
        method: 'post',
        handler: this.createUser.bind(this),
        middlewares: [],
      },
      {
        path: '/user',
        method: 'del',
        handler: this.deleteUser.bind(this),
        middlewares: [auth.bind(this)],
      },
      {
        path: '/user',
        method: 'put',
        handler: this.updateUser.bind(this),
        middlewares: [auth.bind(this)],
      },
    ];
  }

  public async getUserInfo(
    req: IRequest<
      void,
      { userName: string; userEmail: string; userCPF: string },
      string
    >,
    res: Response
  ): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(await this.service.getUserInfo(req.get('userId')))
    );
  }

  public async createUser(req: IRequest<User>, res: Response): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(await this.service.createUser(req.body))
    );
  }

  public async deleteUser(
    req: IRequest<void, void, string>,
    res: Response
  ): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(await this.service.deleteUser(req.get('userId')))
    );
  }

  public async updateUser(
    req: IRequest<void, void, string>,
    res: Response
  ): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(await this.service.updateUser(req.get('userId')))
    );
  }
}
