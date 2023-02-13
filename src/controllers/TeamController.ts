import ServerResponse from '@declarations/classes/Response';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Controller } from '@interfaces/Controller';
import { IRequest } from '@interfaces/Request';
import { Route } from '@interfaces/Route';
import { auth } from '@middlewares/auth';
import { Team } from '@models/Team';
import { TeamService } from '@services/TeamService';
import { Response } from 'restify';
import { inject, injectable } from 'tsyringe';

@injectable()
export class TeamController implements Controller {
  public service: TeamService;

  constructor(@inject(TeamService) service: TeamService) {
    this.service = service;
  }

  get routes(): Route[] {
    return [
      {
        path: '/team',
        method: 'get',
        handler: this.getTeamInfo.bind(this),
        middlewares: [auth.bind(this)],
      },
      {
        path: '/team',
        method: 'post',
        handler: this.createTeam.bind(this),
        middlewares: [auth.bind(this)],
      },
      {
        path: '/team/add',
        method: 'post',
        handler: this.addToTeam.bind(this),
        middlewares: [auth.bind(this)],
      },
      {
        path: '/team/members',
        method: 'get',
        handler: this.getTeamMembers.bind(this),
        middlewares: [auth.bind(this)],
      },
    ];
  }

  public async getTeamInfo(req: IRequest, res: Response): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(await this.service.getTeamInfo(req.get('userId')))
    );
  }

  public async createTeam(req: IRequest<Team>, res: Response): Promise<void> {
    res.send(
      HttpStatusCodes.CREATED,
      new ServerResponse(
        await this.service.createTeam(req.get('userId'), req.body)
      )
    );
  }

  public async addToTeam(
    req: IRequest<{ email: string }>,
    res: Response
  ): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(
        await this.service.addToTeam(req.get('userId'), req.body.email)
      )
    );
  }

  public async getTeamMembers(req: IRequest, res: Response): Promise<void> {
    res.send(
      HttpStatusCodes.OK,
      new ServerResponse(await this.service.listMembers(req.get('userId')))
    );
  }
}
