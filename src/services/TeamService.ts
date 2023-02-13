import { Server } from '@core/Server';
import RouteHandleError from '@declarations/classes/RouteHandleError';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Service } from '@interfaces/Service';
import { Team } from '@models/Team';
import { User } from '@models/User';
import { inject, injectable } from 'tsyringe';

@injectable()
export class TeamService implements Service {
  public server: Server;

  constructor(@inject('server') server: Server) {
    this.server = server;
  }

  public async getTeamInfo(userId: string): Promise<Team> {
    if (!userId) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must be logged in to access this resource'
      );
    }

    const userRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(User);
    });

    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        team: true,
      },
    });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.team) {
      throw new RouteHandleError(
        HttpStatusCodes.NOT_FOUND,
        'User must be in a team'
      );
    }

    const teamRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(Team);
    });

    const team = await teamRepository.findOne({
      where: {
        id: user.team.id,
      },
      relations: {
        master: true,
      },
    });

    return team;
  }

  public async createTeam(userId: string, team: Team): Promise<Team> {
    // console.log(userId);

    if (!userId) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must be logged in to access this resource'
      );
    }

    if (!team) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must provide a team'
      );
    }

    if (!team.name) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must provide a team name'
      );
    }

    if (!team.masterPassword) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must provide a master password'
      );
    }

    const userRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(User);
    });

    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        team: true,
      },
    });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.team) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User already has a team'
      );
    }

    const teamRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(Team);
    });

    const newTeam = teamRepository.create(team);

    newTeam.master = user;
    user.team = newTeam;

    const data = await Promise.all([
      await teamRepository.save(newTeam).catch(e => {
        this.server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          'An error occurred while creating the team'
        );
      }),

      await userRepository.save(user).catch(e => {
        this.server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          'An error occurred while creating the team'
        );
      }),
    ]);

    if (data.length <= 0) {
      throw new RouteHandleError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'An error occurred while creating the team'
      );
    }

    delete data[0].master.team;

    return data[0];
  }

  public async addToTeam(userId: string, memberEmail: string): Promise<Team> {
    if (!userId) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must be logged in to access this resource'
      );
    }

    if (!memberEmail) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must provide a member email'
      );
    }

    const userRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(User);
    });

    const owner = await userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        team: true,
      },
    });

    if (!owner) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    if (!owner.team) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User must be in a team'
      );
    }

    const member = await userRepository.findOne({
      where: {
        email: memberEmail,
      },
      relations: {
        team: true,
      },
    });

    if (!member) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'Member not found');
    }

    if (member.team) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Member already has a team'
      );
    }

    const teamRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(Team);
    });

    const team = await teamRepository.findOne({
      where: {
        id: owner.team.id,
      },
      relations: {
        members: true,
        master: true,
      },
    });

    if (!team) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'Team not found');
    }

    if (team.master.id !== owner.id) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Only the team owner can add members'
      );
    }

    member.team = team;
    team.members.push(member);

    const data = await Promise.all([
      await userRepository.save(member).catch(e => {
        this.server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          'An error occurred while adding the member'
        );
      }),
      await teamRepository.save(team).catch(e => {
        this.server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          'An error occurred while adding the member'
        );
      }),
    ]);

    if (data.length <= 0) {
      throw new RouteHandleError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'An error occurred while adding the member'
      );
    }

    delete data[1].master.team;

    data[1].members.map(m => {
      delete m.team;
    });

    return data[1];
  }

  public async listMembers(userId: string): Promise<User[]> {
    if (!userId) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'You must be logged in to access this resource'
      );
    }

    const userRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(User);
    });

    const user = await userRepository.findOne({
      where: {
        id: userId,
      },

      relations: {
        team: true,
      },
    });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.team) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User must be in a team'
      );
    }

    const teamRepository = await this.server.storage.provide().then(ds => {
      return ds.getRepository(Team);
    });

    const team = await teamRepository.findOne({
      where: {
        id: user.team.id,
      },
      relations: {
        master: true,
        members: true,
      },
    });

    if (!team) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'Team not found');
    }

    if (team.master.id !== user.id) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Only the team owner can list members'
      );
    }

    delete team.master.team;

    return team.members;
  }
}
