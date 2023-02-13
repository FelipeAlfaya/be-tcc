import { Server } from '@core/Server';
import RouteHandleError from '@declarations/classes/RouteHandleError';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Service } from '@interfaces/Service';
import { Log } from '@models/Log';
import { Team } from '@models/Team';
import { User } from '@models/User';
import { inject, injectable } from 'tsyringe';

@injectable()
export class LogService implements Service {
  public server: Server;

  constructor(@inject('server') server: Server) {
    this.server = server;
  }

  public async list(teamId?: string, userId?: string): Promise<Log[]> {
    const logRepository = await this.server.storage.provide().then(_ds => {
      return _ds.getRepository(Log);
    });

    if (teamId) {
      return logRepository.find({
        where: {
          team: {
            id: teamId,
          },
        },

        relations: ['user'],
      });
    }

    return logRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['team'],
    });
  }

  public async log(
    entry: string,
    teamId: string,
    userId: string
  ): Promise<Log> {
    if (!entry) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Entry is required'
      );
    }

    if (!teamId) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Team is required'
      );
    }

    if (!userId) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User is required'
      );
    }

    const logRepository = await this.server.storage.provide().then(_ds => {
      return _ds.getRepository(Log);
    });

    const userRepository = await this.server.storage.provide().then(_ds => {
      return _ds.getRepository(User);
    });

    const teamRepository = await this.server.storage.provide().then(_ds => {
      return _ds.getRepository(Team);
    });

    const team = await teamRepository.findOne({
      where: {
        id: teamId,
      },
      relations: {
        logs: true,
        members: true,
      },
    });

    if (!team) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'Team not found');
    }

    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        logs: true,
        team: true,
      },
    });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    const log = new Log();
    log.entry = entry;
    log.team = team;
    log.user = user;

    return logRepository.save(log).then(log => {
      team.logs.push(log);
      user.logs.push(log);

      return logRepository.save(log);
    });
  }
}
